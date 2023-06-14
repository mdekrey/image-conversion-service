import { injectable } from 'tsyringe';
import {
	TableClient,
	AzureNamedKeyCredential,
	TableEntity,
	odata,
} from '@azure/data-tables';
import {
	BlobServiceClient,
	StorageSharedKeyCredential,
} from '@azure/storage-blob';
import {
	AZURE_STORAGE_ACCOUNT_NAME,
	AZURE_STORAGE_ACCOUNT_KEY,
} from '@/config';
import { OutputFormat } from '@/api-types/models/OutputFormat';

const tableUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net`;
const blobUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;

const sourceImagesTable = 'SourceImages'; // partition & row key = sha of source image
const generatedImagesTable = 'GroupImages'; // partition = group, row = generated image blob name
const imageUsageTable = 'UsedImages'; // row = generated image blob name, partition = group
const sourceImagesContainer = 'sourceimages';
const generatedImagesContainer = 'generatedimages';

export type SourceImageData = {
	width: number;
	height: number;
	lossy: boolean;
	bytes: number;
};
export type SourceImageInputData = {
	format: string;
	sha: string;
} & SourceImageData;
type SourceImageTableRow = TableEntity<
	{
		blobPath: string;
	} & SourceImageData
>;
export type GeneratedImageData = {
	sha: string;
	format: OutputFormat;
	width: number;
	height: number;
	groupId: string;
};
type GeneratedImageTableRow = TableEntity<NonNullable<unknown>>;
type GeneratedImageUsageTableRow = TableEntity<NonNullable<unknown>>;

@injectable()
export class StorageService {
	private readonly sourceTableClient: TableClient;
	private readonly generatedTableClient: TableClient;
	private readonly imageUsageTableClient: TableClient;
	private readonly blobServiceClient: BlobServiceClient;

	constructor() {
		const tableCredentials = new AzureNamedKeyCredential(
			AZURE_STORAGE_ACCOUNT_NAME,
			AZURE_STORAGE_ACCOUNT_KEY
		);
		this.sourceTableClient = new TableClient(
			tableUrl,
			sourceImagesTable,
			tableCredentials
		);
		this.generatedTableClient = new TableClient(
			tableUrl,
			generatedImagesTable,
			tableCredentials
		);
		this.imageUsageTableClient = new TableClient(
			tableUrl,
			imageUsageTable,
			tableCredentials
		);

		const sharedKeyCredential = new StorageSharedKeyCredential(
			AZURE_STORAGE_ACCOUNT_NAME,
			AZURE_STORAGE_ACCOUNT_KEY
		);
		this.blobServiceClient = new BlobServiceClient(
			blobUrl,
			sharedKeyCredential
		);
	}

	async storeSourceImage(imageData: SourceImageInputData, image: Buffer) {
		const { sha, format, ...data } = imageData;

		const blobPath = `${sha}.${format}`;

		const rowData: SourceImageTableRow = {
			partitionKey: sha,
			rowKey: sha,
			blobPath,
			...data,
		};

		const containerClient = this.blobServiceClient.getContainerClient(
			sourceImagesContainer
		);

		if (!(await containerClient.getBlobClient(blobPath).exists())) {
			await containerClient.uploadBlockBlob(blobPath, image, image.length, {
				blobHTTPHeaders: {
					blobContentType: `image/${format}`,
				},
			});
		}
		await this.sourceTableClient.upsertEntity(rowData);
	}

	async getSourceImage(sha: string) {
		const rowData = await this.sourceTableClient.getEntity<SourceImageTableRow>(
			sha,
			sha
		);
		return {
			buffer: await this.blobServiceClient
				.getContainerClient(sourceImagesContainer)
				.getBlobClient(rowData.blobPath)
				.downloadToBuffer(),
			data: rowData as SourceImageData,
		};
	}

	async getPreviouslyGeneratedImageUrl(
		params: GeneratedImageData
	): Promise<string | null> {
		const blobName = this.getGeneratedImageBlobName(params);

		const blobClient = this.blobServiceClient
			.getContainerClient(generatedImagesContainer)
			.getBlobClient(blobName);

		if (await blobClient.exists()) {
			await this.recordGeneratedImageUsage(params);
			if (await blobClient.exists()) return blobClient.url;
		}

		// no hope anymore
		return null;
	}

	async uploadGeneratedImage(
		params: GeneratedImageData,
		image: Buffer
	): Promise<string> {
		const blobName = this.getGeneratedImageBlobName(params);

		const { blockBlobClient } = await this.blobServiceClient
			.getContainerClient(generatedImagesContainer)
			.uploadBlockBlob(blobName, image, image.length, {
				blobHTTPHeaders: { blobContentType: `image/${params.format}` },
			});

		await this.recordGeneratedImageUsage(params);

		return blockBlobClient.url;
	}

	async removeGroup(
		groupId: string
	): Promise<{ references: number; images: number }> {
		const entitiesList = this.generatedTableClient.listEntities({
			queryOptions: { filter: odata`PartitionKey eq ${groupId}` },
		});

		const references: string[] = [];
		let images = 0;
		for await (const entity of entitiesList) {
			const blobName = entity.rowKey ?? '';
			references.push(blobName);
			try {
				await this.imageUsageTableClient.deleteEntity(blobName, groupId);
			} catch (ex) {
				// if the record doesn't exist, that is okay.
			}
			const imageHasReferences = await this.imageHasReferences(blobName);
			if (!imageHasReferences) {
				await this.deleteGeneratedImage(blobName);
				images++;
			}
		}
		for (const entity of references) {
			await this.generatedTableClient.deleteEntity(groupId, entity);
		}
		return { references: references.length, images };
	}

	private async imageHasReferences(blobName: string) {
		const remainingUsage = this.imageUsageTableClient.listEntities({
			queryOptions: { filter: odata`PartitionKey eq ${blobName}` },
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for await (const _unused of remainingUsage) {
			return true;
		}
		return false;
	}

	private async deleteGeneratedImage(blobName: string) {
		await this.blobServiceClient
			.getContainerClient(generatedImagesContainer)
			.getBlobClient(blobName)
			.deleteIfExists();
	}

	private async recordGeneratedImageUsage(params: GeneratedImageData) {
		const blobName = this.getGeneratedImageBlobName(params);

		await this.generatedTableClient.upsertEntity<GeneratedImageTableRow>({
			partitionKey: params.groupId,
			rowKey: blobName,
		});
		await this.imageUsageTableClient.upsertEntity<GeneratedImageUsageTableRow>({
			partitionKey: blobName,
			rowKey: params.groupId,
		});
	}

	private getGeneratedImageBlobName(params: GeneratedImageData) {
		return `${params.sha}-${params.width}-${params.height}.${params.format}`;
	}
}

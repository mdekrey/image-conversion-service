import { RequestParams, Responses } from '@/api-types/operations/uploadImage';
import { ServerResponse } from '@/interfaces/server-response';
import type { UploadImageHandler } from '@/routes/uploadImage';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { inputImageFormatData } from '@/config/image-format-data';
import { SourceImageInputData, StorageService } from './StorageService';
import { injectable } from 'tsyringe';

const badRequest: Readonly<ServerResponse<Responses>> = { statusCode: 400 };

@injectable()
export class UploadImage implements UploadImageHandler {
	constructor(private service: StorageService) {}

	async handle(
		params: RequestParams,
		body: Buffer
	): Promise<ServerResponse<Responses>> {
		try {
			const sourceImageData = await parseAndValidateImage(params, body);
			if (sourceImageData === null) {
				return badRequest;
			}

			this.service.storeSourceImage(sourceImageData, body);

			return { statusCode: 204 };
		} catch (ex) {
			console.error(ex);
			return badRequest;
		}
	}
}

async function parseAndValidateImage(
	params: RequestParams,
	body: Buffer
): Promise<null | SourceImageInputData> {
	const hashSum = createHash('SHA1');
	hashSum.update(body);
	const hex = hashSum.digest('hex');
	if (params.sha !== hex) {
		// sha was not correct, reject
		throw new Error('SHA was not correct');
	}

	const metadata = await sharp(body).metadata();

	const inputFormatData = inputImageFormatData[params.format];

	// successfully parsed format
	if (inputFormatData.sharpFormat !== metadata.format) {
		// format did not match what was uploaded, reject
		throw new Error('Format did not match');
	}

	if (!metadata.width || !metadata.height) {
		throw new Error('Missing width or height in image');
	}

	return {
		sha: hex,
		format: metadata.format,
		width: metadata.width,
		height: metadata.height,
		lossy: inputFormatData.lossy,
		bytes: body.length,
	};
}

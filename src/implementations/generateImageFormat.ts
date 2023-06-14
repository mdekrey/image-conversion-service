import {
	RequestParams,
	Responses,
} from '@/api-types/operations/generateImageFormat';
import { ServerResponse } from '@/interfaces/server-response';
import type { GenerateImageFormatHandler } from '@/routes/generateImageFormat';
import { injectable } from 'tsyringe';
import { SourceImageData, StorageService } from './StorageService';
import sharp from 'sharp';
import { OutputFormat } from '@/api-types/models/OutputFormat';

@injectable()
export class GenerateImageFormat implements GenerateImageFormatHandler {
	constructor(private service: StorageService) {}

	async handle(params: RequestParams): Promise<ServerResponse<Responses>> {
		try {
			let url = await this.service.getPreviouslyGeneratedImageUrl(params);
			if (url === null) {
				console.log('did not exist', params);
				const previousImage = await this.service.getSourceImage(params.sha);
				if (previousImage === null) {
					return { statusCode: 404 };
				}
				const { buffer, data } = previousImage;

				const initial = sharp(buffer);

				const resized = resize(initial, params.width, params.height);
				const formatted = changeFormat[params.format](resized, data);

				const result = await formatted.toBuffer();
				console.log(`reformatted, was ${data.bytes}, now ${result.length}`);
				url = await this.service.uploadGeneratedImage(params, result);
			} else {
				console.log('reusing previously uploaded image');
			}
			return { statusCode: 200, data: url, mimeType: 'application/json' };
		} catch (ex) {
			console.error(ex);
			return { statusCode: 400 };
		}
	}
}

const changeFormat: Record<
	OutputFormat,
	(original: sharp.Sharp, metadata: SourceImageData) => sharp.Sharp
> = {
	jpg: (s) => s.jpeg(),
	png: (s) => s.png(),
	webp: (s, metadata) => s.webp({ lossless: !metadata.lossy }),
	avif: (s, metadata) => s.avif({ lossless: !metadata.lossy }),
};

function resize(original: sharp.Sharp, width: number, height: number) {
	return original.resize({
		width: width,
		height: height,
		// TODO - need more "fit" options
		fit: 'cover',
	});
}

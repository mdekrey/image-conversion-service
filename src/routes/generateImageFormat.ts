import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import {
	RequestParams,
	Responses,
} from '@/api-types/operations/generateImageFormat';
import { ServerResponse } from '@/interfaces/server-response';
import { OutputFormat } from '@/api-types/models/OutputFormat';
import { writeResponse } from './writeResponse';

export interface GenerateImageFormatHandler {
	handle(params: RequestParams): Promise<ServerResponse<Responses>>;
}

const generateImageFormatRouter = Router();

const generateImageFormatHandler =
	container.resolve<GenerateImageFormatHandler>('generateImageFormat');

// I'd prefer using a regex here, but Express doesn't support named parameters
const url = '/generate/:groupId/:width/:height/:sha.:format';

generateImageFormatRouter.get(url, async (req: Request, res: Response) => {
	// TODO - validate parameters
	const requestParams = {
		groupId: req.params.groupId,
		width: parseInt(req.params.width, 10),
		height: parseInt(req.params.height, 10),
		sha: req.params.sha,
		format: req.params.format as OutputFormat,
	};

	const result = await generateImageFormatHandler.handle(requestParams);

	writeResponse(res, result);
});

export default generateImageFormatRouter;

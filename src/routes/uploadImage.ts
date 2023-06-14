import { Router, Request, Response, raw } from 'express';
import { container } from 'tsyringe';
import { RequestParams, Responses } from '@/api-types/operations/uploadImage';
import { ServerResponse } from '@/interfaces/server-response';
import { InputFormat } from '@/api-types/models/InputFormat';
import { writeResponse } from './writeResponse';

export interface UploadImageHandler {
	handle(
		params: RequestParams,
		body: Buffer
	): Promise<ServerResponse<Responses>>;
}

const uploadImageRouter = Router();

const uploadImageHandler = container.resolve<UploadImageHandler>('uploadImage');

// I'd prefer using a regex here, but Express doesn't support named parameters
const url = '/upload/:sha.:format';

uploadImageRouter.put(
	url,
	raw({ type: 'image/*', limit: '2Mb' }),
	async (req: Request, res: Response) => {
		if (!Buffer.isBuffer(req.body)) {
			res.status(400);
			res.send();
		}

		// TODO - validate parameters
		const requestParams = {
			sha: req.params.sha,
			format: req.params.format as InputFormat,
		};

		const result = await uploadImageHandler.handle(requestParams, req.body);

		writeResponse(res, result);
	}
);

export default uploadImageRouter;

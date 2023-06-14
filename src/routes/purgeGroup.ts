import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import { RequestParams, Responses } from '@/api-types/operations/purgeGroup';
import { ServerResponse } from '@/interfaces/server-response';
import { writeResponse } from './writeResponse';

export interface PurgeGroupHandler {
	handle(
		params: RequestParams,
		body: Buffer
	): Promise<ServerResponse<Responses>>;
}

const purgeGroupRouter = Router();

const purgeGroupHandler = container.resolve<PurgeGroupHandler>('purgeGroup');

// I'd prefer using a regex here, but Express doesn't support named parameters
const url = '/purge/:groupId';

purgeGroupRouter.post(url, async (req: Request, res: Response) => {
	// TODO - validate parameters
	const requestParams = {
		groupId: req.params.groupId,
	};

	const result = await purgeGroupHandler.handle(requestParams, req.body);

	writeResponse(res, result);
});

export default purgeGroupRouter;

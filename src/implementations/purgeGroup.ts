import { RequestParams, Responses } from '@/api-types/operations/purgeGroup';
import { ServerResponse } from '@/interfaces/server-response';
import type { PurgeGroupHandler } from '@/routes/purgeGroup';
import { injectable } from 'tsyringe';
import { StorageService } from './StorageService';

@injectable()
export class PurgeGroup implements PurgeGroupHandler {
	constructor(private service: StorageService) {}

	async handle(params: RequestParams): Promise<ServerResponse<Responses>> {
		const removed = await this.service.removeGroup(params.groupId);

		console.log({ removed });
		if (removed.references > 0) return { statusCode: 204 };

		return {
			statusCode: 404,
		};
	}
}

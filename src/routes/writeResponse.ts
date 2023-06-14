import { Response } from 'express';
import { ServerResponse } from '@/interfaces/server-response';

export function writeResponse(res: Response, result: ServerResponse) {
	res.status(result.statusCode);
	if (result.mimeType) {
		res.header('Content-Type', result.mimeType);
	}
	if (result.responseHeaders) {
		for (const header of Object.keys(result.responseHeaders)) {
			res.header(header, result.responseHeaders[header] ?? undefined);
		}
	}
	if (result.mimeType === 'application/json') {
		res.json(result.data);
	} else {
		res.send(result.data);
	}
}

import { Request, Response, NextFunction } from 'express';
import { SECRET_KEY } from '@/config';

export function apiKeyMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (SECRET_KEY && req.headers['x-api-key'] !== SECRET_KEY) {
		res.status(401).send();
	} else {
		return next();
	}
}

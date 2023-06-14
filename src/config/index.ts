import { config } from 'dotenv';
config();

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
	NODE_ENV,
	PORT = 5000,
	SECRET_KEY,
	AZURE_STORAGE_ACCOUNT_NAME = '',
	AZURE_STORAGE_ACCOUNT_KEY = '',
} = process.env;

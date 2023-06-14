import {
	HttpHeaders,
	StandardResponse,
} from '@principlestudios/openapi-codegen-typescript';

export type ServerResponse<T extends StandardResponse = StandardResponse> =
	T extends StandardResponse<infer TStatusCode, infer TMimeType, infer TBody>
		? '' extends TMimeType
			? {
					statusCode: TStatusCode extends 'other' ? number : TStatusCode;
					mimeType?: TMimeType;
					data?: TBody;
					responseHeaders?: HttpHeaders;
			  }
			: {
					statusCode: TStatusCode extends 'other' ? number : TStatusCode;
					mimeType: TMimeType;
					data: TBody;
					responseHeaders?: HttpHeaders;
			  }
		: never;

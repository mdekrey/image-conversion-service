import { InputFormat } from '@/api-types/models/InputFormat';
import { OutputFormat } from '@/api-types/models/OutputFormat';

export const inputImageFormatData: Record<
	InputFormat,
	{
		/** The format string Sharp provides */
		sharpFormat: string;
		/** Whether the image format is treated as lossy */
		lossy: boolean;
	}
> = {
	jpg: { sharpFormat: 'jpeg', lossy: true },
	png: { sharpFormat: 'png', lossy: false },
};

export const outputImageFormatData: Record<
	OutputFormat,
	{
		sharpFormat: string;
		supportLossy: boolean;
		supportLossless: boolean;
	}
> = {
	jpg: { sharpFormat: 'jpeg', supportLossless: false, supportLossy: true },
	png: { sharpFormat: 'png', supportLossless: true, supportLossy: false },
	webp: { sharpFormat: 'webp', supportLossless: true, supportLossy: true },
	avif: { sharpFormat: 'avif', supportLossless: false, supportLossy: true },
};

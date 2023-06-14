import { container } from 'tsyringe';

import { GenerateImageFormat } from '@/implementations/generateImageFormat';
import { UploadImage } from '@/implementations/uploadImage';
import { PurgeGroup } from '@/implementations/purgeGroup';
import { StorageService } from '@/implementations/StorageService';

container.registerSingleton<GenerateImageFormat>(
	'generateImageFormat',
	GenerateImageFormat
);

container.registerSingleton<UploadImage>('uploadImage', UploadImage);

container.registerSingleton<PurgeGroup>('purgeGroup', PurgeGroup);

container.registerSingleton<StorageService>(StorageService, StorageService);

import { Module } from '@nestjs/common';
import { UtilsModule } from '@/utils';
import { DevServiceProvider } from './dev.provider';

@Module({
	imports: [UtilsModule],
	providers: [DevServiceProvider],
})
export class DevModule {}

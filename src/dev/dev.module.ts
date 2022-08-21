import { Module } from '@nestjs/common';
import { Name, UtilsModule } from '@/utils';
import { DevServiceProvider } from './dev.provider';

@Module({
	imports: [UtilsModule],
	providers: [DevServiceProvider],
})
@Name('DevModule')
export class DevModule {}

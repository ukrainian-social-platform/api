import { Module } from '@nestjs/common';
import { UtilsModule } from '@/utils';
import { ProtoHotReloadService } from './proto-hot-reload.service';

@Module({
	imports: [UtilsModule],
	providers: [ProtoHotReloadService],
})
export class ProtoHotReloadModule {}

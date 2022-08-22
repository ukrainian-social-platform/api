import { Module } from '@nestjs/common';
import { UtilsModule } from '@/utils';
import { ProtoHotReloadService } from './proto-hot-reload.service';
import { GrpcDocsModule } from '@/dev/grpc-docs';

@Module({
	imports: [UtilsModule, GrpcDocsModule],
	providers: [ProtoHotReloadService],
})
export class ProtoHotReloadModule {}

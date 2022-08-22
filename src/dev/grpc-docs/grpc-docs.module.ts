import { Module } from '@nestjs/common';
import { ConfigService, UtilsModule } from '@/utils';
import { StaticServerModule } from '@/dev/static-server';
import { GrpcDocsService, GRPC_GENERATED_DOCS_PATH } from './grpc-docs.service';

@Module({
	imports: [
		UtilsModule,
		StaticServerModule.forRootAsync({
			imports: [UtilsModule],
			inject: [ConfigService],
			useFactory(config: ConfigService) {
				return {
					servePath: GRPC_GENERATED_DOCS_PATH,
					port: Number(config.get('DOCS_PORT')),
				};
			},
		}),
	],
	providers: [GrpcDocsService],
	exports: [GrpcDocsService],
})
export class GrpcDocsModule {}

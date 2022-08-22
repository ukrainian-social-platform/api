import { UtilsModule } from '@/utils';
import { DynamicModule, Module } from '@nestjs/common';
import {
	createStaticServerProvider,
	StaticServerAsyncOptions,
} from './static-server.provider';

@Module({})
export class StaticServerModule {
	static forRootAsync(opts: StaticServerAsyncOptions): DynamicModule {
		return {
			imports: [UtilsModule, ...(opts.imports || [])],
			module: StaticServerModule,
			providers: [createStaticServerProvider(opts)],
		};
	}
}

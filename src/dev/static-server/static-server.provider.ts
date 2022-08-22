import { CommonUtilsService } from '@/utils';
import { Provider } from '@nestjs/common';
import { StaticServerService } from './static-server.service';

type MaybePromise<T> = T | Promise<T>;

export type StaticServerAsyncOptions = {
	imports?: any[];
	inject?: any[];
	useFactory: (
		...args: any[]
	) => MaybePromise<{ servePath: string; port: number }>;
};

export function createStaticServerProvider({
	inject,
	useFactory,
}: StaticServerAsyncOptions): Provider<StaticServerService> {
	return {
		provide: Symbol(),
		inject: [CommonUtilsService, ...(inject || [])],
		async useFactory(utils, ...args: any[]) {
			const { port, servePath } = await useFactory(...args);
			return new StaticServerService(port, servePath, utils);
		},
	};
}

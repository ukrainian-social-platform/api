import { Provider } from '@nestjs/common';
import {
	CommonUtilsService,
	CronUtilsService,
	MicroserviceUtilsService,
} from '@/utils';
import { DevService } from './dev.service';

async function loadDeps() {
	const [
		// loaded packages
		{ loadSync: protoLoader },
	] = await (Promise.all(
		[
			// list of packages to load dynamically, w/o bundling
			'@grpc/proto-loader',
		].map((v) => import(v)),
	) as Promise<
		[
			// list of package types, in the same order as packages
			typeof import('@grpc/proto-loader'),
		]
	>);
	return { protoLoader };
}

export const DevServiceProvider: Provider<DevService> = {
	provide: DevService,
	inject: [CommonUtilsService, CronUtilsService, MicroserviceUtilsService],
	async useFactory(
		utils: CommonUtilsService,
		cron: CronUtilsService,
		microservice: MicroserviceUtilsService,
	) {
		if (utils.isProd()) return {} as DevService;
		const { protoLoader } = await loadDeps();
		return new DevService(utils, cron, microservice, protoLoader);
	},
};

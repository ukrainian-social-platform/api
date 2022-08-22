import { readFile } from 'node:fs/promises';
import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { loadSync as protoLoader } from '@grpc/proto-loader';
import {
	CommonUtilsService,
	CronUtilsService,
	MicroserviceUtilsService,
} from '@/utils';

export class ProtoHotReloadService implements OnApplicationBootstrap {
	private readonly logger = new Logger(ProtoHotReloadService.name);
	private lastGrpcProtoContent: string;

	constructor(
		private readonly utils: CommonUtilsService,
		private readonly cron: CronUtilsService,
		private readonly microservice: MicroserviceUtilsService,
	) {}

	private checkGrpcProtoChanges = async (): Promise<void> => {
		const nextContent = await this.getGrpcProtoContents();
		if (this.lastGrpcProtoContent !== nextContent) {
			this.lastGrpcProtoContent = nextContent;
			if (!this.checkProto()) return;
			this.logger.log(
				`${this.microservice.getGrpcProtoPath()} has been changed, restarting the app`,
			);
			this.utils.reloadApp();
		}
	};

	private getGrpcProtoContents(): Promise<string> {
		return readFile(this.microservice.getGrpcProtoPath(), 'utf8');
	}

	private checkProto() {
		try {
			protoLoader(this.microservice.getGrpcProtoPath());
			return true;
		} catch (e) {
			this.logger.error(e);
			return false;
		}
	}

	private async prepareGrpcHotReload(): Promise<void> {
		this.lastGrpcProtoContent = await this.getGrpcProtoContents();
		const tab = this.cron.Tab.fromPeriod(Date.now(), 200);
		this.cron.add(tab, this.checkGrpcProtoChanges, '', false);
	}

	async onApplicationBootstrap() {
		await this.prepareGrpcHotReload();
	}
}

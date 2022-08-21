import { readFile } from 'node:fs/promises';
import {
	Injectable,
	Logger,
	OnApplicationBootstrap,
	OnApplicationShutdown,
} from '@nestjs/common';
import {
	CommonUtilsService,
	CronUtilsService,
	MicroserviceUtilsService,
	Name,
} from '@/utils';

@Injectable()
@Name('DevService')
export class DevService
	implements OnApplicationBootstrap, OnApplicationShutdown
{
	private readonly logger = new Logger(DevService.name);
	private lastGrpcProtoContent: string;

	constructor(
		private readonly utils: CommonUtilsService,
		private readonly cron: CronUtilsService,
		private readonly microservice: MicroserviceUtilsService,
		private readonly protoLoader: typeof import('@grpc/proto-loader')['loadSync'],
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
			this.protoLoader(this.microservice.getGrpcProtoPath());
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
		this.logger.log(
			"Looks like you're in dev environment, enabling local dev stuff",
		);
		await this.prepareGrpcHotReload();
	}

	async onApplicationShutdown() {
		this.cron.remove(this.checkGrpcProtoChanges);
	}
}

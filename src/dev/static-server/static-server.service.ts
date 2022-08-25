import { OnApplicationBootstrap } from '@nestjs/common';
import createServer, { FastifyInstance } from 'fastify';
import staticPlugin from '@fastify/static';
import { CommonUtilsService } from '@/utils';

export class StaticServerService implements OnApplicationBootstrap {
	private server: FastifyInstance;

	constructor(
		private readonly port: number,
		private readonly servePath: string,
		private readonly utils: CommonUtilsService,
	) {}

	private getPath(): string {
		return this.utils.resolvePath(this.servePath);
	}

	async onApplicationBootstrap() {
		this.server = await createServer();
		await this.server.register(staticPlugin, {
			root: this.getPath(),
		});
		await this.server.listen({ port: this.port });
	}
}

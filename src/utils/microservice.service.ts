import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { CommonUtilsService } from './common.service';
import { Name } from './name.decorator';

@Injectable()
@Name('UtilsModule::MicroserviceUtilsService')
export class MicroserviceUtilsService {
	constructor(
		private readonly config: ConfigService,
		private readonly utils: CommonUtilsService,
	) {}

	getRmqUrls(): [string] {
		const proto = this.config.get('AMQP_PROTO'),
			user = this.config.get('AMQP_USER'),
			pass = this.config.get('AMQP_PASS'),
			host = this.config.get('AMQP_HOST'),
			port = this.config.get('AMQP_PORT');
		return [`${proto}://${user}:${pass}@${host}:${port}`];
	}

	getGrpcProtoPath(): string {
		return this.utils.resolvePath('@/main.proto');
	}

	getGrpcPackageName(): string {
		return 'ua.social_platform.api';
	}

	async callRemoteMethod<D = any, R = any>(
		client: ClientProxy,
		controller: string,
		method: string,
		data: D,
	): Promise<R> {
		const resp = await (firstValueFrom(
			client.send({ controller, method }, data),
		) as MicroserviceUtilsService.RPCResult<R>);
		if ('error' in resp) {
			throw new Error(resp.error.message);
		}
		return resp.result;
	}
}

export namespace MicroserviceUtilsService {
	export type RPCResult<T> = Promise<
		{ result: T } | { error: Error | { message: string } }
	>;
}

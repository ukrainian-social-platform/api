/* eslint-disable @typescript-eslint/ban-ts-comment */
// We're "hacking" existing gRPC server extending some private processes.
// That's why we should fix @nestjs/microservices version and disable eslint's ts comment bans

import { Name } from '@/utils';
import { Logger } from '@nestjs/common';
import { CustomStrategy, ServerGrpc } from '@nestjs/microservices';

// @ts-ignore
class ExtGrpcServer extends ServerGrpc {
	constructor(
		getPackage: () => string,
		getProtoPath: () => string,
		private readonly getUrl: () => string | Promise<string>,
		private readonly dynServerLogger: Logger,
	) {
		const options: any = {};
		Object.defineProperties(options, {
			package: { get: getPackage },
			protoPath: { get: getProtoPath },
		});
		super(options);
	}

	private setUrl(value: string) {
		// @ts-ignore
		this.url = value;
	}

	async listen(
		callback: (err?: unknown, ...optionalParams: unknown[]) => void,
	) {
		const url = await this.getUrl();
		this.setUrl(url);
		await super.listen((err, ...args) => {
			if (!err) this.dynServerLogger.log(`Listening on ${url}`);
			callback(err, ...args);
		});
	}

	async createServices(grpcPkg: any) {
		// @ts-ignore
		await super.createServices(grpcPkg);
		// Take all of the services defined in grpcPkg and assign them to
		// method handlers defined in Controllers
		for (const definition of this.getServiceNames(grpcPkg)) {
			console.log(definition.name);
			const service: any = await this.createService(
				definition.service,
				definition.name,
			);
			console.log(service.SayHello.toString());
		}
	}
}

@Name('DynamicGrpcServer')
export class DynamicGrpcServer implements CustomStrategy {
	logger = new Logger(DynamicGrpcServer.name);
	strategy: ExtGrpcServer;

	constructor(
		getPackage: () => string,
		getProtoPath: () => string,
		getUrl: () => string | Promise<string>,
	) {
		this.strategy = new ExtGrpcServer(
			getPackage,
			getProtoPath,
			getUrl,
			this.logger,
		);
	}
}

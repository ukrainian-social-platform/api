import { Name } from '@/utils';
import { Logger } from '@nestjs/common';
import { CustomStrategy, ServerGrpc } from '@nestjs/microservices';

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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

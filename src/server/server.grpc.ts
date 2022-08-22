import { CustomStrategy, ServerGrpc } from '@nestjs/microservices';

class ExtGrpcServer extends ServerGrpc {
	constructor(
		getPackage: () => string,
		getProtoPath: () => string,
		private readonly getUrl: () => string | Promise<string>,
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

	async listen(callback: any) {
		this.setUrl(await this.getUrl());
		await super.listen(callback);
	}
}

export class DynamicGrpcServer implements CustomStrategy {
	strategy: ExtGrpcServer;

	constructor(
		getPackage: () => string,
		getProtoPath: () => string,
		getUrl: () => string | Promise<string>,
	) {
		this.strategy = new ExtGrpcServer(getPackage, getProtoPath, getUrl);
	}
}

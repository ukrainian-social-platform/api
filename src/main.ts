import { NestFactory } from '@nestjs/core';
import { INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from '@/app';
import { MicroserviceUtilsService, CommonUtilsService } from '@/utils';
import { DynamicGrpcServer } from '@/server';

async function bootstrap() {
	const app: INestMicroservice =
		await NestFactory.createMicroservice<MicroserviceOptions>(
			AppModule,
			new DynamicGrpcServer(
				() => app.get(MicroserviceUtilsService).getGrpcPackageName(),
				() => app.get(MicroserviceUtilsService).getGrpcProtoPath(),
				() => app.get(MicroserviceUtilsService).getGrpcServerUrl(),
			),
		);
	const utils = app.get(CommonUtilsService);
	utils.setReloadFunc(async () => {
		await app.close();
		await app.listen();
	});
	utils.setProjectRoot(__dirname);
	await app.listen();
}

bootstrap();

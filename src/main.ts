import { NestFactory } from '@nestjs/core';
import { INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from '@/app';
import { MicroserviceUtilsService, CommonUtilsService } from '@/utils';

async function bootstrap() {
	const app: INestMicroservice =
		await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
			transport: Transport.GRPC,
			options: {
				get package() {
					return app
						.get(MicroserviceUtilsService)
						.getGrpcPackageName();
				},
				get protoPath() {
					return app.get(MicroserviceUtilsService).getGrpcProtoPath();
				},
			},
		});
	const utils = app.get(CommonUtilsService);
	utils.setReloadFunc(async () => {
		await app.close();
		await app.listen();
	});
	utils.setProjectRoot(__dirname);
	await app.listen();
}

bootstrap();

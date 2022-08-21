import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Name } from './name.decorator';
import { CommonUtilsService } from './common.service';
import { MicroserviceUtilsService } from './microservice.service';
import { ConfigService, ConfigServiceProvider } from './config.service';
import { CronUtilsService } from './cron.service';

@Module({
	imports: [ConfigModule.forRoot()],
	providers: [
		ConfigServiceProvider,
		CommonUtilsService,
		CronUtilsService,
		MicroserviceUtilsService,
	],
	exports: [
		ConfigService,
		CommonUtilsService,
		CronUtilsService,
		MicroserviceUtilsService,
	],
})
@Name('UtilsModule')
export class UtilsModule {}

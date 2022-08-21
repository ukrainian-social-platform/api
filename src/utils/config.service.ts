import { Injectable, Logger, Provider } from '@nestjs/common';
import {
	ConfigModule,
	ConfigService as OriginalConfigService,
} from '@nestjs/config';
import { Name } from './name.decorator';

type Config = {
	NODE_ENV: 'development' | 'production';
	AMQP_PROTO: string;
	AMQP_USER: string;
	AMQP_PASS: string;
	AMQP_HOST: string;
	AMQP_PORT: string;
};

const defaultValues: Config = {
	NODE_ENV: 'development',
	AMQP_PROTO: 'amqp',
	AMQP_USER: 'guest',
	AMQP_PASS: 'guest',
	AMQP_HOST: 'localhost',
	AMQP_PORT: '15671',
};

@Injectable()
@Name('UtilsModule::ConfigService')
export class ConfigService extends OriginalConfigService<Config> {}

export const ConfigServiceProvider: Provider<ConfigService> = {
	provide: ConfigService,
	inject: [OriginalConfigService], // ensure module's used
	async useFactory() {
		const logger = new Logger(ConfigService.name);
		await ConfigModule.envVariablesLoaded;
		logger.log('Loaded env variables');
		return new ConfigService(defaultValues);
	},
};

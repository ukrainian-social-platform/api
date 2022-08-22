import { env } from 'node:process';
import { Module, DynamicModule } from '@nestjs/common';
import { Name, UtilsModule } from '@/utils';

const devModulePath = './dev.module';

export function getRestModules(): Promise<DynamicModule>[] {
	// it's appropriate to reference env directly here because NODE_ENV should be specified outside of the app
	if (env.NODE_ENV === 'production') return [];
	return [
		(import(devModulePath) as Promise<typeof import('./dev.module')>).then(
			(module) => ({
				module: module.DevModule,
			}),
		),
	];
}

@Module({
	imports: [UtilsModule, ...getRestModules()],
	providers: [],
})
@Name('DevHostModule')
export class DevHostModule {}

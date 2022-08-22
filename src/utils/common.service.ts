import { resolve } from 'node:path';
import { Injectable, ModuleMetadata } from '@nestjs/common';
import { ConfigService } from './config.service';
import { Name } from './name.decorator';

@Injectable()
@Name('UtilsModule::CommonUtilsService')
export class CommonUtilsService {
	private projectRoot = '';
	private reload: () => Promise<void>;

	constructor(private readonly config: ConfigService) {}

	isProd(): boolean {
		return this.config.get('NODE_ENV') === 'production';
	}

	setProjectRoot(value: string) {
		if (this.projectRoot) {
			throw new ReferenceError(
				'Project root is already defined in another place',
			);
		}
		this.projectRoot = value;
	}

	setReloadFunc(reload: () => Promise<void>) {
		if (this.reload) {
			throw new ReferenceError(
				'Reload function is already defined in another place',
			);
		}
		this.reload = reload;
	}

	reloadApp() {
		this.reload();
	}

	resolvePath(...parts: string[]): string {
		if (parts[0].startsWith('@/')) {
			parts[0] = parts[0].slice(2);
			parts.unshift(this.projectRoot);
		} else if (parts[0] === '@') {
			parts[0] = this.projectRoot;
		}
		return resolve(...parts);
	}
}

export namespace CommonUtilsService {
	type AsyncModuleBasic = Pick<ModuleMetadata, 'imports'> & {
		inject?: any[];
	};

	type Reenumerate<O> = { [x in keyof O]: O[x] };

	export type AsyncModuleSignature<
		Options,
		SyncOptions extends keyof Options,
	> = Reenumerate<
		AsyncModuleBasic & {
			[x in SyncOptions]: Options[x];
		} & {
			useFactory: (
				...args: any[]
			) =>
				| Promise<Omit<Options, SyncOptions>>
				| Omit<Options, SyncOptions>;
		}
	>;
}

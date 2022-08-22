import { platform, arch } from 'node:process';
import { mkdir, rm, writeFile, access } from 'node:fs/promises';
import { sep as pathSeparator } from 'node:path';
import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { spawn } from 'node:child_process';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	CommonUtilsService,
	ConfigService,
	MicroserviceUtilsService,
} from '@/utils';
import { extract as untar } from 'tar-stream';
import gunzip from 'gunzip-maybe';
import { Parse as unzip } from 'unzipper';

const modulePath = '@/dev/grpc-docs';

export const GRPC_GENERATED_DOCS_PATH = modulePath + '/generated';

type OSDefs = { [x in typeof platform]?: string };
type ArchDefs = { [x in typeof arch]?: string };

const supportedPluginOSes: OSDefs = {
	linux: 'linux',
	win32: 'windows',
	darwin: 'darwin',
};

const supportedPluginArchs: ArchDefs = {
	x64: 'amd64',
	arm64: 'arm64',
};

const supportedProtocOSes: OSDefs = {
	linux: 'linux',
	win32: 'win',
	darwin: 'osx',
};

const supportedProtocArchs: ArchDefs = {
	ia32: 'x86_32',
	x64: 'x86_64',
	arm64: 'aarch_64',
	ppc64: 'ppcle_64',
	s390x: 's390_64',
};

const pluginSupportList = [
	`${supportedPluginOSes.linux}_${supportedPluginArchs.x64}`,
	`${supportedPluginOSes.linux}_${supportedPluginArchs.arm64}`,
	`${supportedPluginOSes.win32}_${supportedPluginArchs.x64}`,
	`${supportedPluginOSes.win32}_${supportedPluginArchs.arm64}`,
	`${supportedPluginOSes.darwin}_${supportedPluginArchs.x64}`,
	`${supportedPluginOSes.darwin}_${supportedPluginArchs.arm64}`,
];

const protocSupportList = [
	protocAnnotation('linux', 'ia32'),
	protocAnnotation('linux', 'x64'),
	protocAnnotation('linux', 'arm64'),
	protocAnnotation('linux', 'ppc64'),
	protocAnnotation('linux', 's390x'),
	protocAnnotation('win32', 'ia32'),
	protocAnnotation('win32', 'x64'),
	protocAnnotation('darwin', 'x64'),
	protocAnnotation('darwin', 'arm64'),
];

const pluginPlatformAnnotation = `${supportedPluginOSes[platform]}_${supportedPluginArchs[arch]}`;

const protocPlatformAnnotation = protocAnnotation(platform, arch);

const pluginVersion = '1.5.1';

const protocVersion = '21.5';

const executableSuffix = platform === 'win32' ? '.exe' : '';

function protocAnnotation(os: typeof platform, architecture: typeof arch) {
	const archAnnotation = supportedProtocArchs[architecture];
	const isWin = os === 'win32';
	const slice = isWin && ['ia32', 'x64'].includes(architecture) ? [4] : [0];
	return (
		supportedProtocOSes[os] +
		(isWin ? '' : '-') +
		archAnnotation.slice(...slice)
	);
}

@Injectable()
export class GrpcDocsService implements OnModuleInit {
	private readonly logger = new Logger(GrpcDocsService.name);
	private readonly pluginSupported = pluginSupportList.includes(
		pluginPlatformAnnotation,
	);
	private readonly protocSupported = protocSupportList.includes(
		protocPlatformAnnotation,
	);

	constructor(
		private readonly utils: CommonUtilsService,
		private readonly config: ConfigService,
		private readonly microservice: MicroserviceUtilsService,
	) {}

	private async fileExists(path: string) {
		try {
			await access(path);
			return true;
		} catch (e) {
			return false;
		}
	}

	private async unpackZipArchive(
		zipStream: ReadableStream<Uint8Array>,
	): Promise<{ [name: string]: Buffer }> {
		const results: { [name: string]: Buffer } = {};
		const stream = Readable.fromWeb(zipStream).pipe(
			unzip({ forceStream: true }),
			{ end: false },
		);
		for await (const entry of stream) {
			if (entry.type === 'Directory') {
				entry.autodrain();
				return;
			}
			results[entry.path] = await entry.buffer();
		}
		return results;
	}

	private unpackTarArchive(
		tarballStream: ReadableStream<Uint8Array>,
	): Promise<{ [name: string]: Buffer }> {
		const results: { [name: string]: Buffer } = {};
		return new Promise((resolve) => {
			Readable.fromWeb(tarballStream)
				.pipe(gunzip())
				.pipe(untar())
				.on('entry', async function (header, stream, next) {
					const chunks = [];
					for await (const chunk of stream) {
						chunks.push(chunk);
					}
					results[header.name] = Buffer.concat(chunks);
					next();
				})
				.on('finish', function () {
					resolve(results);
				});
		});
	}

	private async downloadProtoc() {
		const path = this.getProtocPath();
		if (await this.fileExists(path)) {
			this.logger.verbose(
				'Protoc compiler already exists, skipping download',
			);
			return;
		}
		if (!this.protocSupported) {
			return this.logger.warn(
				"Protoc compiler isn't supported on your platform yet",
			);
		}
		const link = `https://github.com/protocolbuffers/protobuf/releases/download/v${protocVersion}/protoc-${protocVersion}-${protocPlatformAnnotation}.zip`;
		this.logger.verbose('Downloading protoc compiler from ' + link);
		const stream = await fetch(link).then((r) => r.body);
		const { ['bin/' + this.getProtocName()]: bin } =
			await this.unpackZipArchive(stream as any);
		await writeFile(path, bin, {
			mode: 0o755,
		});
	}

	private async downloadGeneratorPlugin() {
		const path = this.getPluginPath();
		if (await this.fileExists(path)) {
			this.logger.verbose(
				'Generator plugin already exists, skipping download',
			);
			return;
		}
		if (!this.pluginSupported) {
			return this.logger.warn(
				"Generator plugin isn't supported on your platform yet",
			);
		}
		const link = `https://github.com/pseudomuto/protoc-gen-doc/releases/download/v${pluginVersion}/protoc-gen-doc_${pluginVersion}_${pluginPlatformAnnotation}.tar.gz`;
		this.logger.verbose('Downloading generator plugin from ' + link);
		const stream = await fetch(link).then((r) => r.body);
		const { [this.getPluginName()]: plugin } = await this.unpackTarArchive(
			stream as any,
		);
		await writeFile(path, plugin, {
			mode: 0o755,
		});
	}

	private getGeneratedDocsPath(): string {
		return this.utils.resolvePath(GRPC_GENERATED_DOCS_PATH);
	}

	private getPluginName() {
		return 'protoc-gen-doc' + executableSuffix;
	}

	private getProtocName() {
		return 'protoc' + executableSuffix;
	}

	private getPluginPath() {
		return this.utils.resolvePath(modulePath + '/' + this.getPluginName());
	}

	private getProtocPath() {
		return this.utils.resolvePath(modulePath + '/' + this.getProtocName());
	}

	private async clearOldDocs(path: string) {
		await rm(path, {
			recursive: true,
			force: true,
		});
	}

	private execProcess(executable: string, args: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			const cp = spawn(executable, args, {
				stdio: 'inherit',
			});
			cp.once('error', reject);
			cp.once('exit', (code) => {
				if (code) reject(new Error('Process exited with code ' + code));
				else resolve();
			});
		});
	}

	private async runGenerator() {
		const protoPath = this.microservice
			.getGrpcProtoPath()
			.split(pathSeparator);
		const protoName = protoPath.pop();
		await this.execProcess(this.getProtocPath(), [
			'--plugin=protoc-gen-doc=' + this.getPluginPath(),
			'--doc_out=' + this.getGeneratedDocsPath(),
			'--doc_opt=html,index.html',
			'--proto_path=' + protoPath.join(pathSeparator),
			protoName,
		]);
	}

	async generateDocs() {
		const path = this.getGeneratedDocsPath();
		await this.clearOldDocs(path);
		await mkdir(path, { recursive: true });
		await this.runGenerator();
		this.logger.verbose('Refreshed docs');
	}

	async onModuleInit() {
		await Promise.all([
			this.downloadProtoc(),
			this.downloadGeneratorPlugin(),
		]);
		this.logger.log(
			'Listening on http://localhost:' + this.config.get('DOCS_PORT'),
		);
	}
}

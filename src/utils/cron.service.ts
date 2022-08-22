import { Name } from './name.decorator';
import { Injectable, Logger } from '@nestjs/common';

enum CronUtilsServicePeriods {
	millisecond = 1,
	second = CronUtilsServicePeriods.millisecond * 1000,
	minute = CronUtilsServicePeriods.second * 60,
	hour = CronUtilsServicePeriods.minute * 60,
	day = CronUtilsServicePeriods.hour * 24,
	week = CronUtilsServicePeriods.day * 7,
}

class CronUtilsServiceTab {
	interval: number;
	next: number;

	constructor(start: Date | number, next: Date | number) {
		this.next = Number(next);
		this.interval = this.next - Number(start);
	}

	get firstTimeout(): number {
		const currentTime = Date.now();
		while (currentTime > this.next) {
			this.next += this.interval;
		}
		return this.next - currentTime;
	}

	static fromPeriod(start: Date | number, period: number) {
		return new CronUtilsServiceTab(start, Number(start) + period);
	}
}

@Injectable()
@Name('UtilsModule::CronUtilsService')
export class CronUtilsService {
	private readonly logger = new Logger(CronUtilsService.name);
	private readonly timerMap = new Map<
		() => void | Promise<void>,
		[NodeJS.Timer, string, boolean]
	>();

	Tab = CronUtilsServiceTab;
	Periods = CronUtilsServicePeriods;

	private async run(
		func: () => void | Promise<void>,
		name?: string,
		log?: boolean,
	) {
		const start = Date.now();
		try {
			await func();
			if (!log) return;
			this.logger.log(
				`Task ${name || func.name} done in ${Date.now() - start}ms`,
			);
		} catch (e) {
			if (log) {
				this.logger.log(
					`Task ${name || func.name} failed in ${
						Date.now() - start
					}ms`,
				);
			}
			this.logger.warn(e);
		}
	}

	add(
		tab: CronUtilsServiceTab,
		func: () => void | Promise<void>,
		name?: string,
		log = true,
	) {
		if (this.timerMap.has(func)) return;
		const nextTimeout = tab.firstTimeout;
		this.timerMap.set(func, [
			setTimeout(() => {
				this.timerMap.set(func, [
					setInterval(() => this.run(func, name, log), tab.interval),
					name,
					log,
				]);
				this.run(func, name, log);
			}, nextTimeout),
			name,
			log,
		]);
		if (!log) return;
		this.logger.log(
			`Added ${name || func.name} to tasks. Next execution at ${new Date(
				tab.next,
			).toLocaleString('en-UK')}`,
		);
	}

	remove(func: () => void | Promise<void>) {
		if (!this.timerMap.has(func)) return;
		const [handler, name, log] = this.timerMap.get(func);
		clearTimeout(handler);
		clearInterval(handler);
		this.timerMap.delete(func);
		if (!log) return;
		this.logger.log(`Removed ${name || func.name} from tasks`);
	}
}

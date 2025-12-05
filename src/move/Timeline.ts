import { clamp } from '../math/clamp.js';
import { Tween } from './Tween.js';
import type { ITween } from '../types.js';

export interface TimelineOptions {
	delay?: number;
}

export class Timeline {
	public previousPosition: number;
	public startTime: number | null = null;
	public delayTime: number = 0;
	public durationMS: number = 0;
	public progress: number = 0;
	public easingFunction: (t: number) => number = (k) => k;
	public totalTime: number = 0;

	protected _driverTween: Tween | null = null;
	protected _tweens: ITween[] = [];
	protected _loopNum: number = 0;

	private _startTimes: number[] = [];
	private _durations: number[] = [];
	private _cursor: number = 0;

	constructor({ delay = 0 }: TimelineOptions = {}) {
		this.previousPosition = 0;
		this.delayTime = delay * 1000;
	}

	protected static setTweenIn(tween: Tween, isIn: boolean) {
		tween.isTimelineIn = isIn;

		if (tween.isTimelineIn !== tween.isPreviousTimelineIn) {
			if (isIn) {
				tween.onTimelineInCallback?.();
			} else if (!isIn) {
				tween.onTimelineOutCallback?.();
			}

			tween.isPreviousTimelineIn = tween.isTimelineIn;
		}
	}

	protected static setTweenVisibility(tween: Tween, isVisible: boolean) {
		tween.isTimelineVisible = isVisible;

		if (tween.isTimelineVisible !== tween.isPreviousTimelineVisible) {
			if (isVisible) {
				tween.onTimelineVisibleCallback?.();
			} else if (!isVisible) {
				tween.onTimelineInvisibleCallback?.();
			}

			tween.isPreviousTimelineVisible = tween.isTimelineVisible;
		}
	}

	public delay(amount: number): this {
		this.delayTime = amount * 1000;
		return this;
	}

	public loop(num: number = Infinity): this {
		this._loopNum = num;
		return this;
	}

	public stop() {
		this._driverTween?.stop();
		return this;
	}

	public destroy() {
		this.stop();

		for (let i = 0; i < this._tweens.length; i++) {
			this._tweens[i].stop();
		}

		this._tweens.length = 0;
		this.totalTime = 0;
	}

	public add(tween: ITween, offset: number = 0): this {
		const durationMS = tween.totalTime !== undefined ? tween.totalTime : tween.durationMS;
		const offsetMS = offset * 1000;
		const startTime = this._cursor + offsetMS;

		this._register(tween, startTime, durationMS);

		return this;
	}

	public at(time: number, tween: ITween): this {
		const durationMS = tween.totalTime !== undefined ? tween.totalTime : tween.durationMS;
		const startTime = time * 1000;

		this._register(tween, startTime, durationMS);

		return this;
	}

	private _register(tween: ITween, startTime: number, durationMS: number) {
		tween.delayTime = startTime;

		this._tweens.push(tween);
		this._startTimes.push(startTime);
		this._durations.push(durationMS);

		const endTime = startTime + durationMS;

		if (endTime > this._cursor) {
			this._cursor = endTime;
		}

		if (endTime > this.totalTime) {
			this.totalTime = endTime;
		}
	}

	public async start(): Promise<this> {
		this.stop();

		const driver = new Tween((x) => {
			this.setPosition(x);
		}, this.totalTime / 1000);

		this._driverTween = driver;

		if (this._loopNum !== 0) {
			driver.loop(this._loopNum);
		}

		driver.delay(this.delayTime / 1000);

		return driver.start().then(() => this);
	}

	public setPosition(position: number) {
		this.progress = clamp(position, 0, 1);

		const time = this.progress * this.totalTime;
		const count = this._tweens.length;
		const starts = this._startTimes;
		const durations = this._durations;
		const tweens = this._tweens;

		for (let i = 0; i < count; i++) {
			const tween = tweens[i];
			const start = starts[i];
			const duration = durations[i];
			const end = start + duration;

			if (time < start) {
				tween.invalidate?.();
				tween.setPosition(0);

				if (tween instanceof Tween) {
					Timeline.setTweenVisibility(tween, false);
					Timeline.setTweenIn(tween, false);
				}
			} else if (time >= end) {
				tween.invalidate?.();
				tween.setPosition(1);

				if (tween instanceof Tween) {
					Timeline.setTweenVisibility(tween, true);
					Timeline.setTweenIn(tween, false);
				}
			} else {
				const progress = duration === 0 ? 1 : (time - start) / duration;

				tween.invalidate?.();
				tween.setPosition(progress);

				if (tween instanceof Tween) {
					Timeline.setTweenVisibility(tween, true);
					Timeline.setTweenIn(tween, true);
				}
			}
		}

		this.previousPosition = position;
	}

	public update() {
		this.setPosition(this.previousPosition || 0);

		return true;
	}
}

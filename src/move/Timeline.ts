import { AbstractTimeline, TimelineOptions } from './AbstractTimeline.js';
import { clamp } from '../math/clamp.js';
import { Tween } from './Tween.js';
import type { ITween } from '../types.js';

export class Timeline extends AbstractTimeline {

	private _startTimes: number[] = [];
	private _durations: number[] = [];
	private _cursor: number = 0;

	constructor(options?: TimelineOptions) {
		super(options);
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
		if (endTime > this._cursor) this._cursor = endTime;
		if (endTime > this.totalTime) this.totalTime = endTime;
	}

	// [IMPROVEMENT]: Stop existing driver before creating a new one
	public start(): Promise<this> {
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
		const time = clamp(position, 0, 1) * this.totalTime;
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
				tween.setPosition(0);
				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, false);
					AbstractTimeline.setTweenIn(tween, false);
					tween.invalidate();
					tween.updateAllValues();
				}
			} else if (time >= end) {
				tween.setPosition(1);
				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, true);
					AbstractTimeline.setTweenIn(tween, false);
					tween.invalidate();
					tween.updateAllValues();
				}
			} else {
				const progress = duration === 0 ? 1 : (time - start) / duration;
				tween.setPosition(progress);

				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, true);
					AbstractTimeline.setTweenIn(tween, true);
					tween.invalidate();
					tween.updateAllValues();
				}
			}
		}
		this.previousPosition = position;
	}

	public update(time?: number) {
		this.setPosition(this.previousPosition || 0);
		return true;
	}
}
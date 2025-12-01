import { Tween } from './Tween.js';
import type { ITween } from '../types.js';

export interface TimelineOptions {
	delay?: number;
}

export abstract class AbstractTimeline implements ITween {
	public previousPosition: number;
	public startTime: number | null = null;
	public delayTime: number = 0;
	public durationMS: number = 0;
	public value: number = 0;
	public easingFunction: (t: number) => number = (k) => k;
	public totalTime: number = 0;

	protected _driverTween: Tween | null = null;
	protected _tweens: ITween[] = [];
	protected _loopNum: number = 0;

	constructor({ delay = 0 }: TimelineOptions = {}) {
		this.previousPosition = 0;
		this.delayTime = delay * 1000;
	}

	protected static setTweenIn(tween: Tween, isIn: boolean) {
		tween.timelineIn = isIn;

		if (tween.timelineIn !== tween.previousTimelineIn) {
			if (isIn && tween.onTimelineInCallback && tween.object) {
				tween.onTimelineInCallback(tween.object);
			} else if (!isIn && tween.onTimelineOutCallback && tween.object) {
				tween.onTimelineOutCallback(tween.object);
			}

			tween.previousTimelineIn = tween.timelineIn;
		}
	}

	protected static setTweenVisibility(tween: Tween, isVisible: boolean) {
		tween.timelineVisible = isVisible;

		if (tween.timelineVisible !== tween.previousTimelineVisible) {
			if (isVisible && tween.onTimelineVisibleCallback && tween.object) {
				tween.onTimelineVisibleCallback(tween.object);
			} else if (!isVisible && tween.onTimelineInvisibleCallback && tween.object) {
				tween.onTimelineInvisibleCallback(tween.object);
			}

			tween.previousTimelineVisible = tween.timelineVisible;
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

	public start(): Promise<this> {
		// Scalar tween constructor overload
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

	public abstract setPosition(position: number): void;
	public abstract update(time: number): boolean;

	public updateAllValues() {}
	public invalidate() {}
}

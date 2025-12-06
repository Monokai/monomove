import { tween } from '../index.js';
import { clamp } from '../math/clamp.js';
import type { ITween, EasingType, IScalarTween } from '../types.js';

export interface TimelineOptions {
	delay?: number;
	onComplete?: () => void;
	onLoop?: () => void;
}

interface TimelineItem {
	tween: ITween;
	startTime: number;
	endTime: number;
	duration: number;
}

export class Timeline {
	public time: number = 0;
	public totalTime: number = 0;
	public isPlaying: boolean = false;

	private _items: TimelineItem[] = [];
	private _delayTime: number;
	private _loopCount: number = 0;
	private _onComplete: (() => void) | undefined;
	private _onLoop: (() => void) | undefined;
	private _isDirty: boolean = true;

	private _driver: IScalarTween | null = null;
	private _easing: EasingType = 'linear';
	private _timeScale: number = 1;

	constructor({ delay = 0, onComplete, onLoop }: TimelineOptions = {}) {
		this._delayTime = delay * 1000;
		this._onComplete = onComplete;
		this._onLoop = onLoop;
	}

	public add(tween: ITween, offset: number = 0): this {
		const lastEnd = this._items.length > 0 ? this._items[this._items.length - 1].endTime : 0;
		const startTime = Math.max(0, lastEnd + offset * 1000);

		this._register(tween, startTime);

		return this;
	}

	public at(seconds: number, tween: ITween): this {
		this._register(tween, seconds * 1000);

		return this;
	}

	private _register(tween: ITween, startTime: number) {
		const duration = tween.totalTime !== undefined ? tween.totalTime : tween.durationMS;

		this._items.push({
			tween,
			startTime,
			endTime: startTime + duration,
			duration
		});

		this.totalTime = Math.max(this.totalTime, startTime + duration);
		this._isDirty = true;
	}

	public delay(seconds: number): this {
		this._delayTime = seconds * 1000;

		return this;
	}

	public loop(count: number = Infinity): this {
		this._loopCount = count;

		return this;
	}

	public easing(easing: EasingType): this {
		this._easing = easing;

		return this;
	}

	public timeScale(scale: number): this {
		this._timeScale = scale;

		if (this._driver && this.isPlaying) {
			this.stop().start();
		}

		return this;
	}

	public async start(): Promise<this> {
		if (this._isDirty) {
			this._sort();
		}

		this.stop();

		this.isPlaying = true;

		const isReverse = this._timeScale < 0;
		const startValue = isReverse ? this.totalTime : 0;
		const endValue = isReverse ? 0 : this.totalTime;

		this._driver = tween()
			.from(startValue)
			.to(endValue)
			.duration(this.totalTime / 1000 / Math.abs(this._timeScale))
			.onUpdate((x: number) => {
				this.time = x;
				this._updateChildren(this.time, false);
			})
			.easing(this._easing)
			.delay(this._delayTime / 1000)
			.loop(this._loopCount)
			.onLoop(() => {
				this._onLoop?.();
				this._updateChildren(isReverse ? this.totalTime : 0, true);
			})
			.onComplete(() => {
				this.isPlaying = false;
				this._onComplete?.();
			});

		// _driver is assigned above, so it is not null here.
		return this._driver!.start().then(() => this);
	}

	public pause(): this {
		this.isPlaying = false;
		this._driver?.stop();

		return this;
	}

	public stop(): this {
		this.pause();
		this._driver = null;
		this.time = this._timeScale < 0 ? this.totalTime : 0;
		this._updateChildren(this.time, true);

		return this;
	}

	public setPosition(position: number, force: boolean = false) {
		if (this.isPlaying) {
			this.pause();
		}

		if (this._isDirty) {
			this._sort();
		}

		this.time = clamp(position, 0, this.totalTime);

		this._updateChildren(this.time, force);
	}

	public setProgress(progress: number) {
		this.setPosition(clamp(progress, 0, 1) * this.totalTime);
	}

	private _sort() {
		this._items.sort((a, b) => a.startTime - b.startTime);
		this._isDirty = false;
	}

	private _updateChildren(currentTime: number, force: boolean) {
		const len = this._items.length;

		// 1. Reset FUTURE items (Reverse Loop)
		for (let i = len - 1; i >= 0; i--) {
			const item = this._items[i];

			if (currentTime < item.startTime) {
				const t = item.tween;

				// We don't need 'instanceof Tween' check if ITween has these properties
				// But we need to ensure the property exists on ITween
				const isVisible = t.isTimelineVisible;

				if (t.progress > 0 || isVisible || force) {
					t.setProgress(0, true);

					if (force) {
						t.invalidate();
					}

					Timeline.setTweenVisibility(t, false);
				}
			}
		}

		// 2. Update PAST and ACTIVE items (Forward Loop)
		for (let i = 0; i < len; i++) {
			const item = this._items[i];
			const { tween, startTime, endTime, duration } = item;

			if (currentTime < startTime) {
				continue;
			}

			// Past
			if (currentTime >= endTime) {
				if (tween.progress !== 1 || force) {
					const oldProgress = tween.progress;

					tween.setProgress(1, true);

					Timeline.setTweenVisibility(tween, true);

					if (oldProgress < 1 && tween.progress === 1) {
						tween.onTimelineOutCallback?.();
					}
				}

				continue;
			}

			// Active
			const localTime = currentTime - startTime;
			const progress = duration === 0 ? 1 : localTime / duration;
			const oldProgress = tween.progress;

			tween.setProgress(progress, true);

			Timeline.setTweenVisibility(tween, true);

			if (oldProgress === 0 && tween.progress > 0) {
				tween.onTimelineInCallback?.();
			}
			if (oldProgress < 1 && tween.progress === 1) {
				tween.onTimelineOutCallback?.();
			}
		}
	}

	protected static setTweenVisibility(tween: ITween, isVisible: boolean) {
		tween.isTimelineVisible = isVisible;

		if (tween.isTimelineVisible !== tween.isPreviousTimelineVisible) {
			if (isVisible) {
				tween.onTimelineVisibleCallback?.();
			} else {
				tween.onTimelineInvisibleCallback?.();
			}

			tween.isPreviousTimelineVisible = tween.isTimelineVisible;
		}
	}
}

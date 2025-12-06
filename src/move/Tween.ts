import { RenderLoop } from './RenderLoop.js';
import { TweenManager } from './TweenManager.js';
import type {
	EasingFunction,
	EasingType,
	TweenableObject,
	ObjectUpdateCallback,
	ScalarUpdateCallback,
	CompleteCallback,
	LoopCallback,
	StartCallback,
	TimelineCallback,
	EasingOptions,
	BezierLike,
	ITween
} from '../types.js';

type KeyValueMap = Record<string, number>;

export class Tween<T extends TweenableObject = TweenableObject> implements ITween {
	public durationMS: number;
	public isPlaying: boolean;
	public delayTime: number;
	public startTime: number | null;
	public easingFunction: EasingFunction;
	public progress: number;
	public totalTime?: number;

	public onTimelineInCallback: (() => void) | null = null;
	public onTimelineOutCallback: (() => void) | null = null;
	public onTimelineVisibleCallback: (() => void) | null = null;
	public onTimelineInvisibleCallback: (() => void) | null = null;
	public isTimelineIn = false;
	public isPreviousTimelineIn = false;
	public isTimelineVisible = false;
	public isPreviousTimelineVisible = false;

	private _objectOrValue: T | number | null;

	private _onUpdateCallback: ObjectUpdateCallback<T> | ScalarUpdateCallback | null;
	private _onLoopCallback: LoopCallback<T> | null;
	private _onCompleteCallback: CompleteCallback<T> | null;
	private _onStartCallback: StartCallback<T> | null;

	private _valuesEnd: Partial<T> | { value: number };
	private _valuesStart: KeyValueMap;

	private _propKeys: string[];
	private _propStartValues: number[];
	private _propChangeValues: number[];

	private _loopNum: number;
	private _loopCount: number;
	private _onStartCallbackFired: boolean;
	private _previousTime: number | null;
	private _elapsed: number;
	private _previousUpdateValue: number | null;
	private _inverseDuration: number;
	private _targetIsFunction: boolean;
	private _startValuesCalculated: boolean = false;

	constructor();
	constructor(object: T, duration?: number);
	constructor(callback: ScalarUpdateCallback, duration?: number);
	constructor(objectOrCallback: T | ScalarUpdateCallback, duration?: number);
	constructor(objectOrCallback?: T | ScalarUpdateCallback, duration: number = 1) {
		this.durationMS = duration * 1000;
		this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;
		this.easingFunction = (k) => k;
		this.progress = 0;
		this.delayTime = 0;
		this.isPlaying = false;
		this.startTime = null;

		this._loopNum = 0;
		this._loopCount = 0;
		this._onLoopCallback = null;
		this._onCompleteCallback = null;
		this._onStartCallback = null;
		this._onStartCallbackFired = false;
		this._previousTime = null;
		this._elapsed = 0;
		this._previousUpdateValue = null;

		this._valuesStart = {};
		this._propKeys = [];
		this._propStartValues = [];
		this._propChangeValues = [];
		this._startValuesCalculated = false;

		if (objectOrCallback === undefined) {
			this._targetIsFunction = true;
			this._objectOrValue = 0;
			this._onUpdateCallback = null;
			this._valuesStart['value'] = 0;
			this._valuesEnd = { value: 1 };
		} else if (typeof objectOrCallback === 'function') {
			this._targetIsFunction = true;
			this._objectOrValue = 0;
			this._onUpdateCallback = objectOrCallback;
			this._valuesStart['value'] = 0;
			this._valuesEnd = { value: 1 };
		} else {
			this._targetIsFunction = false;
			this._objectOrValue = objectOrCallback;
			this._onUpdateCallback = null;
			this._valuesEnd = {};
		}
	}

	from(properties: Partial<T> | number): this {
		if (typeof properties === 'object' && properties !== null) {
			if (
				this._targetIsFunction &&
				this._onUpdateCallback === null &&
				this._objectOrValue === 0
			) {
				this._targetIsFunction = false;
				this._objectOrValue = {} as T;
				this._valuesStart = {};
				this._valuesEnd = {};
			}
		}

		if (typeof properties === 'number') {
			this._valuesStart['value'] = properties;
		} else if (this._targetIsFunction) {
			const props = properties as KeyValueMap;
			const keys = Object.keys(props);

			for (const key of keys) {
				const val = props[key];

				if (typeof val === 'number') {
					this._valuesStart[key] = val;
				}
			}
		} else {
			const props = properties as KeyValueMap;

			for (const key in props) {
				const val = props[key];

				if (typeof val === 'number') {
					this._valuesStart[key] = val;
				}
			}
		}

		this._startValuesCalculated = false;

		return this;
	}

	to(properties: Partial<T> | number, duration?: number): this {
		if (duration !== undefined) {
			this.durationMS = duration * 1000;
			this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;
		}

		if (typeof properties === 'object' && properties !== null) {
			if (
				this._targetIsFunction &&
				this._onUpdateCallback === null &&
				this._objectOrValue === 0
			) {
				this._targetIsFunction = false;
				this._objectOrValue = {} as T;
				this._valuesStart = {};
				this._valuesEnd = {};
			}
		}

		if (typeof properties === 'number') {
			(this._valuesEnd as { value: number }).value = properties;
		} else {
			this._valuesEnd = { ...this._valuesEnd, ...properties };
		}

		this._startValuesCalculated = false;

		return this;
	}

	duration(duration: number): this {
		this.durationMS = duration * 1000;
		this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;

		return this;
	}

	rewind(): this {
		this.stop();
		this.progress = 0;
		this._elapsed = 0;
		this._previousUpdateValue = null;

		if (this._startValuesCalculated) {
			this.setProgress(0);
		}

		return this;
	}

	restart(): Promise<this> {
		this.rewind();

		return this.start();
	}

	loop(num: number = Infinity): this {
		this._loopNum = num;
		this._loopCount = num;

		return this;
	}

	onLoop(callback: LoopCallback<T>): this {
		this._onLoopCallback = callback;

		return this;
	}

	delay(amount: number): this {
		this.delayTime = amount * 1000;

		return this;
	}

	easing(_easing: EasingType = (k) => k, easingOptions?: EasingOptions): this {
		if (!_easing) {
			return this;
		}

		if (typeof _easing === 'string') {
			const cached = TweenManager.getEasingFromCache(_easing);

			if (easingOptions) {
				TweenManager.setEasingOptions(cached, easingOptions);
			}

			this.easingFunction = cached.get.bind(cached);
		} else if (typeof _easing === 'object' && _easing !== null && 'get' in _easing) {
			const bezier = _easing as BezierLike;

			if (easingOptions) {
				TweenManager.setEasingOptions(bezier, easingOptions);
			}

			this.easingFunction = bezier.get.bind(bezier);
		} else {
			this.easingFunction = _easing as EasingFunction;
		}

		return this;
	}

	onUpdate(callback: ObjectUpdateCallback<T> | ScalarUpdateCallback): this {
		this._onUpdateCallback = callback;

		return this;
	}

	onStart(callback: StartCallback<T>): this {
		this._onStartCallback = callback;

		return this;
	}

	onComplete(callback: CompleteCallback<T>): this {
		this._onCompleteCallback = callback;

		return this;
	}

	onTimelineIn(callback: TimelineCallback<T>): this {
		this.onTimelineInCallback = () => callback(this._objectOrValue);

		return this;
	}

	onTimelineOut(callback: TimelineCallback<T>): this {
		this.onTimelineOutCallback = () => callback(this._objectOrValue);

		return this;
	}

	onTimelineVisible(callback: TimelineCallback<T>): this {
		this.onTimelineVisibleCallback = () => callback(this._objectOrValue);

		return this;
	}

	onTimelineInvisible(callback: TimelineCallback<T>): this {
		this.onTimelineInvisibleCallback = () => callback(this._objectOrValue);

		return this;
	}

	start(time?: number): Promise<this> {
		const onComplete = this._onCompleteCallback;
		return new Promise((resolve) => {
			this._onCompleteCallback = (obj) => {
				onComplete?.(obj);
				this._onCompleteCallback = onComplete;
				resolve(this);
			};
			this.startTween(time);
		});
	}

	startTween(time: number = RenderLoop.getTime()): this {
		const wasPlaying = this.isPlaying;

		this._elapsed = 0;
		this._onStartCallbackFired = false;
		this.isPlaying = true;
		this.startTime = time + this.delayTime;

		if (this.durationMS === 0 && this._loopNum === 0 && this.delayTime === 0) {
			this.update(time);
			this.isPlaying = false;
		} else if (!wasPlaying) {
			TweenManager.add(this);
			RenderLoop.triggerAnimation();
		}

		return this;
	}

	stop(): this {
		if (!this.isPlaying) {
			return this;
		}

		this.isPlaying = false;
		TweenManager.remove(this);

		return this;
	}

	private _calculateStartValues() {
		if (this._startValuesCalculated) return;

		this._propKeys.length = 0;
		this._propStartValues.length = 0;
		this._propChangeValues.length = 0;

		const obj = this._objectOrValue as KeyValueMap;

		if (this._targetIsFunction) {
			const start = this._valuesStart['value'] ?? 0;
			const end = (this._valuesEnd as { value: number }).value ?? 1;

			this._propKeys.push('value');
			this._propStartValues.push(start);
			this._propChangeValues.push(end - start);
		} else if (obj) {
			const endValues = this._valuesEnd as KeyValueMap;

			for (const key in endValues) {
				const end = endValues[key];
				if (end === undefined) continue;

				let start: number;
				if (this._valuesStart[key] !== undefined) {
					start = this._valuesStart[key];
				} else {
					const currentVal = obj[key];
					start = typeof currentVal === 'number' ? currentVal : 0;
				}

				this._propKeys.push(key);
				this._propStartValues.push(start);
				this._propChangeValues.push(end - start);
			}
		}

		this._startValuesCalculated = true;
	}

	updateAllValues(delta: number = 0) {
		if (!this._startValuesCalculated) {
			this._calculateStartValues();
		}

		if (this._targetIsFunction) {
			if (this._propStartValues.length > 0) {
				const start = this._propStartValues[0];
				const change = this._propChangeValues[0];
				const val = start + change * this.progress;

				if (this._onUpdateCallback) {
					(this._onUpdateCallback as ScalarUpdateCallback)(val, this.progress, delta);
				}
			}
			return;
		}

		const len = this._propKeys.length;
		const keys = this._propKeys;
		const starts = this._propStartValues;
		const changes = this._propChangeValues;
		const obj = this._objectOrValue as KeyValueMap;

		for (let i = 0; i < len; i++) {
			obj[keys[i]] = starts[i] + changes[i] * this.progress;
		}

		if (this._onUpdateCallback && this._objectOrValue) {
			(this._onUpdateCallback as ObjectUpdateCallback<T>)(
				this._objectOrValue as T,
				this.progress,
				delta
			);
		}
	}

	setProgress(progress: number, force: boolean = false) {
		if (!this._startValuesCalculated) {
			this._calculateStartValues();
		}

		const normalized = progress < 0 ? 0 : progress > 1 ? 1 : progress;

		if (
			!force &&
			this._previousUpdateValue !== null &&
			Math.abs(normalized - this._previousUpdateValue) < 1e-6
		) {
			return;
		}

		this.progress = this.easingFunction(normalized);
		this.updateAllValues();
		this._previousUpdateValue = normalized;
	}

	invalidate(): void {
		this._previousUpdateValue = null;
		this._startValuesCalculated = false;
	}

	update(time: number): boolean {
		if (this.startTime === null || time < this.startTime) {
			return true;
		}

		if (!this._startValuesCalculated) {
			this._calculateStartValues();
		}

		if (this._onStartCallbackFired === false) {
			this._onStartCallback?.(this._objectOrValue);
			this._onStartCallbackFired = true;

			RenderLoop.trigger();
		}

		this._elapsed = time - this.startTime;

		const normalizedElapsed = this.durationMS === 0 ? 1 : this._elapsed * this._inverseDuration;
		const clamped = normalizedElapsed > 1 ? 1 : normalizedElapsed;

		this.progress = this.easingFunction(clamped);

		if (this._previousTime === null) {
			this._previousTime = time;
		}

		const delta = time - this._previousTime;
		this._previousTime = time;

		this.updateAllValues(delta);

		if (clamped === 1) {
			const tempStartTime = this.startTime;

			if (this.durationMS === 0) {
				if (this.isPlaying) {
					this._onCompleteCallback?.(this._objectOrValue);
				}

				this.isPlaying = false;

				return false;
			}

			if (this._loopCount > 0) {
				this._onLoopCallback?.(this._objectOrValue, this._loopNum - this._loopCount);
				this._loopCount--;
				this.startTime += this.durationMS;
				this._elapsed = time - this.startTime;

				return true;
			} else if (this.isPlaying) {
				this._onCompleteCallback?.(this._objectOrValue);
			}

			const restarted = tempStartTime !== this.startTime;

			this.isPlaying = restarted || (this.isPlaying && normalizedElapsed < 1);

			return this.isPlaying;
		}

		return true;
	}
}

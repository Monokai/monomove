import { RenderLoop } from './RenderLoop.js';
import { TweenManager } from './TweenManager.js';
import type {
	EasingFunction,
	EasingType,
	TweenableObject,
	UpdateCallback,
	ObjectUpdateCallback,
	ScalarUpdateCallback,
	CompleteCallback,
	LoopCallback,
	StartCallback,
	TimelineCallback,
	ITween,
	BezierLike,
	EasingOptions
} from '../types.js';

type KeyValueMap = Record<string, number>

export class Tween<T extends TweenableObject = TweenableObject> implements ITween {
	public durationMS: number;
	public isPlaying: boolean;
	public delayTime: number;
	public startTime: number | null;
	public easingFunction: EasingFunction;
	public progress: number;
	public onTimelineInCallback: (() => void) | null = null;
	public onTimelineOutCallback: (() => void) | null = null;
	public onTimelineVisibleCallback: (() => void) | null = null;
	public onTimelineInvisibleCallback: (() => void) | null = null;
	public isTimelineIn = false;
	public isPreviousTimelineIn = false;
	public isTimelineVisible = false;
	public isPreviousTimelineVisible = false;

	private _objectOrValue: T | number | null;
	private _onUpdateCallback: UpdateCallback<T> | null;
	private _onLoopCallback: LoopCallback<T> | null;
	private _onCompleteCallback: CompleteCallback<T> | null;
	private _onStartCallback: StartCallback<T> | null;
	private _valuesEnd: Partial<T>;
	private _valuesStart: KeyValueMap;
	private _propKeys: (keyof T)[];
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
	private _isInitialized: boolean = false;

	constructor(object: T, duration?: number);
	constructor(callback: ScalarUpdateCallback, duration?: number);
	constructor(objectOrCallback: T | ScalarUpdateCallback, duration: number = 1) {
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
		this._isInitialized = false;

		if (typeof objectOrCallback === 'function') {
			this._targetIsFunction = true;
			this._objectOrValue = 0;
			this._onUpdateCallback = objectOrCallback;

			this._valuesStart['value'] = 0;
			this._valuesEnd = { value: 1 } as unknown as Partial<T>;
		} else {
			this._targetIsFunction = false;
			this._objectOrValue = objectOrCallback;
			this._onUpdateCallback = null;
			this._valuesEnd = {};

			const obj = this._objectOrValue as KeyValueMap;
			const keys = Object.keys(obj);

			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const val = obj[key];

				if (typeof val === 'number') {
					this._valuesStart[key] = val;
				}
			}
		}
	}

	from(properties: Partial<T>) {
		if (this._targetIsFunction) {
			const props = properties as KeyValueMap;
			const keys = Object.keys(props);

			for (const key of keys) {
				const val = props[key];

				if (typeof val === 'number') {
					this._valuesStart[key] = val;
				}
			}
		} else {
			for (const key in properties) {
				const val = properties[key];

				if (typeof val === 'number' && typeof this._objectOrValue !== 'number') {
					(this._objectOrValue as KeyValueMap)[key] = val;
					this._valuesStart[key] = val;
				}
			}
		}

		this._isInitialized = false;

		if (this._onUpdateCallback) {
			this.updateAllValues(0);
		}

		return this;
	}

	to(properties: Partial<T>, duration?: number) {
		if (duration !== undefined) {
			this.durationMS = duration * 1000;
			this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;
		}

		this._valuesEnd = { ...this._valuesEnd, ...properties };
		this._isInitialized = false;

		return this;
	}

	duration(duration: number) {
		this.durationMS = duration * 1000;
		this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;

		return this;
	}

	rewind() {
		this.stop();
		this.progress = 0;
		this._elapsed = 0;

		if (!this._targetIsFunction && this._objectOrValue) {
			const obj = this._objectOrValue as KeyValueMap;

			for (const key in this._valuesStart) {
				obj[key] = this._valuesStart[key];
			}
		}

		this._isInitialized = false;
		this.invalidate();

		return this;
	}

	restart() {
		return this.rewind().start();
	}

	loop(num: number = Infinity) {
		this._loopNum = num;
		this._loopCount = num;

		return this;
	}

	setLoopCallback(callback: LoopCallback<T>) {
		this._onLoopCallback = callback;

		return this;
	}

	private _init() {
		if (this._isInitialized) {
			return;
		}

		this._propKeys.length = 0;
		this._propStartValues.length = 0;
		this._propChangeValues.length = 0;

		if (!this._targetIsFunction && this._objectOrValue) {
			let hasEndValues = false;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			for (const _ in this._valuesEnd) {
				hasEndValues = true;

				break;
			}

			if (!hasEndValues) {
				const obj = this._objectOrValue as KeyValueMap;

				for (const key in obj) {
					if (key in this._valuesStart) {
						const val = obj[key];

						if (typeof val === 'number') {
							(this._valuesEnd as KeyValueMap)[key] = val;
						}
					}
				}
			}
		}

		for (const key in this._valuesEnd) {
			const end = this._valuesEnd[key];

			let start = this._valuesStart[key];

			if (!this._targetIsFunction && start === undefined && this._objectOrValue) {
				const obj = this._objectOrValue as KeyValueMap;
				const currentVal = obj[key];

				if (typeof currentVal === 'number') {
					start = currentVal;

					this._valuesStart[key] = start;
				}
			}

			if (this._targetIsFunction && start === undefined) {
				start = 0;
			}

			if (typeof start === 'number' && typeof end === 'number') {
				this._propKeys.push(key as keyof T);
				this._propStartValues.push(start);
				this._propChangeValues.push(end - start);
			}
		}

		this._isInitialized = true;
	}

	startTween(time: number = RenderLoop.getTime()) {
		this._init();

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

	stop() {
		if (!this.isPlaying) {
			return this;
		}

		this.isPlaying = false;

		TweenManager.remove(this);

		return this;
	}

	delay(amount: number) {
		this.delayTime = amount * 1000;

		return this;
	}

	easing(
		_easing: EasingType = (k) => k,
		easingOptions?: EasingOptions
	) {
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

	onStart(callback: StartCallback<T>) {
		this._onStartCallback = callback;

		return this;
	}

	onUpdate(callback: UpdateCallback<T>) {
		this._onUpdateCallback = callback;

		return this;
	}

	onComplete(callback: CompleteCallback<T>) {
		this._onCompleteCallback = callback;

		return this;
	}

	onTimelineIn(callback: TimelineCallback<T>) {
		this.onTimelineInCallback = () => callback(this._objectOrValue);

		return this;
	}

	onTimelineOut(callback: TimelineCallback<T>) {
		this.onTimelineOutCallback = () => callback(this._objectOrValue);

		return this;
	}

	onTimelineVisible(callback: TimelineCallback<T>) {
		this.onTimelineVisibleCallback = () => callback(this._objectOrValue);

		return this;
	}

	onTimelineInvisible(callback: TimelineCallback<T>) {
		this.onTimelineInvisibleCallback = () => callback(this._objectOrValue);

		return this;
	}

	setPosition(position: number) {
		this._init();

		const normalized = position < 0 ? 0 : position > 1 ? 1 : position;

		this.progress = this.easingFunction(normalized);
		this.updateAllValues();
	}

	updateAllValues(delta: number = 0) {
		if (!this._isInitialized) {
			this._init();
		}

		if (this.progress === this._previousUpdateValue) {
			return;
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
		} else {
			const len = this._propKeys.length;
			const keys = this._propKeys;
			const starts = this._propStartValues;
			const changes = this._propChangeValues;
			const obj = this._objectOrValue as KeyValueMap;

			for (let i = 0; i < len; i++) {
				obj[keys[i] as string] = starts[i] + changes[i] * this.progress;
			}

			if (this._onUpdateCallback && this._objectOrValue) {
				(this._onUpdateCallback as ObjectUpdateCallback<T>)(
					this._objectOrValue as T,
					this.progress,
					delta
				);
			}
		}

		this._previousUpdateValue = this.progress;
	}

	invalidate() {
		this._previousUpdateValue = null;

		return this;
	}

	update(time: number): boolean {
		if (this.startTime === null || time < this.startTime) {
			return true;
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

import RenderLoop from './RenderLoop.js';
import TweenManager from './TweenManager.js';
import type { 
	EasingFunction, 
	EasingType, 
	TweenableObject, 
	UpdateCallback, 
	CompleteCallback,
	LoopCallback,
	StartCallback,
	TimelineCallback,
	ITween,
	BezierLike
} from '../types.js';

interface EasingOptions {
	iterations?: number;
	cacheSize?: number;
}

export default class Tween<T extends TweenableObject = TweenableObject> implements ITween {

	public durationMS: number;
	public isPlaying: boolean;
	public delayTime: number;
	public startTime: number | null;
	public easingFunction: EasingFunction;
	public object: T;
	public value: number;

	public onTimelineInCallback: TimelineCallback<T> | null = null;
	public onTimelineOutCallback: TimelineCallback<T> | null = null;
	public onTimelineVisibleCallback: TimelineCallback<T> | null = null;
	public onTimelineInvisibleCallback: TimelineCallback<T> | null = null;
	
	public timelineIn = false;
	public previousTimelineIn = false;
	public timelineVisible = false;
	public previousTimelineVisible = false;

	private _onUpdateCallback: UpdateCallback<T> | null;
	private _onLoopCallback: LoopCallback<T> | null;
	private _onCompleteCallback: CompleteCallback<T> | null;
	private _onStartCallback: StartCallback<T> | null;
	
	private _valuesEnd: Partial<T>;
	private _valuesStart: Record<string, number>;

	// OPTIMIZATION: Structure of Arrays (SoA)
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

	constructor(object: T | UpdateCallback<T> = {} as T, duration: number = 1) {
		this.durationMS = duration * 1000;
		this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;
		this.easingFunction = k => k;
		this.value = 0;
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
		
		// Initialize parallel arrays
		this._propKeys = [];
		this._propStartValues = [];
		this._propChangeValues = [];

		if (typeof object === 'function' && duration !== undefined) {
			this.object = { value: 0 } as unknown as T;
			this._onUpdateCallback = object as unknown as UpdateCallback<T>;
			this._valuesEnd = { value: 1 } as unknown as Partial<T>;
			this._valuesStart['value'] = 0;
		} else {
			this.object = object as T;
			this._onUpdateCallback = null;
			this._valuesEnd = {};
			
			const keys = Object.keys(this.object);
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const val = this.object[key];
				if (typeof val === 'number') {
					this._valuesStart[key] = val;
				}
			}
		}
	}

	from(properties: Partial<T>) {
		for (const key in properties) {
			const val = properties[key];
			if (typeof val === 'number') {
				// Assert that the number value is assignable to the generic type property
				this.object[key as keyof T] = val as unknown as T[keyof T];
				this._valuesStart[key] = val;
			}
		}

		if (this._onUpdateCallback !== null) {
			this._onUpdateCallback(this.object, this.value, 0);
		}

		return this;
	}

	to(properties: Partial<T>, duration?: number) {
		if (duration !== undefined) {
			this.durationMS = duration * 1000;
			this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;
		}

		this._valuesEnd = properties;
		return this;
	}

	duration(duration: number) {
		this.durationMS = duration * 1000;
		this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;
		return this;
	}

	rewind() {
		for (const key in this._valuesStart) {
			// Restore start values to object
			this.object[key as keyof T] = this._valuesStart[key] as unknown as T[keyof T];
		}
		this.value = this.easingFunction(0);
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

	startTween(time: number = RenderLoop.getTime()) {
		const wasPlaying = this.isPlaying;

		this._elapsed = 0;
		this._onStartCallbackFired = false;
		this.isPlaying = true;
		this.startTime = time + this.delayTime;

		// Reset parallel arrays
		this._propKeys.length = 0;
		this._propStartValues.length = 0;
		this._propChangeValues.length = 0;

		// Populate valuesEnd if empty
		let hasEndValues = false;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const _ in this._valuesEnd) { hasEndValues = true; break; }

		if (!hasEndValues) {
			 for (const key in this.object) {
				 if (key in this._valuesStart) {
					 const k = key as keyof T;
					 const val = this.object[k];
					 if (typeof val === 'number') {
						// Safe assignment: val comes from T[k], _valuesEnd is Partial<T>
						this._valuesEnd[k] = val;
					 }
				 }
			 }
		}

		// Pre-calculate deltas and populate parallel arrays
		for (const key in this._valuesEnd) {
			const end = this._valuesEnd[key];
			
			let start = this._valuesStart[key];
			if (start === undefined && typeof this.object[key] === 'number') {
				start = this.object[key];
				this._valuesStart[key] = start;
			}

			if (typeof start === 'number' && typeof end === 'number') {
				this._propKeys.push(key as keyof T);
				this._propStartValues.push(start);
				this._propChangeValues.push(end - start);
			}
		}

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

		return new Promise(resolve => {
			this._onCompleteCallback = (obj, t) => {
				if (onComplete) {
					onComplete(obj, t);
				}
				this._onCompleteCallback = onComplete;
				resolve(this);
			};

			this.startTween(time);
		});
	}

	stop() {
		if (!this.isPlaying) return this;
		this.isPlaying = false;
		TweenManager.remove(this);
		return this;
	}

	delay(amount: number) {
		this.delayTime = amount * 1000;
		return this;
	}

	easing(_easing: EasingType = k => k, {
		iterations = TweenManager.bezierIterations ?? undefined,
		cacheSize = TweenManager.bezierCacheSize ?? undefined
	}: EasingOptions = {}) {
		let easing: EasingType = _easing;

		if (!easing) return this;

		if (typeof easing === 'string') {
			easing = TweenManager.getEasingFromCache(easing);
		}

		if (typeof easing === 'object' && easing !== null && 'get' in easing) {
			const bezier = easing as BezierLike;
			if (iterations && bezier.setIterations) bezier.setIterations(iterations);
			if (cacheSize && bezier.setCacheSize) bezier.setCacheSize(cacheSize);
			this.easingFunction = bezier.get.bind(bezier);
		} else {
			this.easingFunction = easing as EasingFunction;
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

	onComplete(callback: CompleteCallback<T> | null = null) {
		this._onCompleteCallback = callback;
		return this;
	}

	onTimelineIn(callback: TimelineCallback<T>) {
		this.onTimelineInCallback = callback;
		return this;
	}

	onTimelineOut(callback: TimelineCallback<T>) {
		this.onTimelineOutCallback = callback;
		return this;
	}

	onTimelineVisible(callback: TimelineCallback<T>) {
		this.onTimelineVisibleCallback = callback;
		return this;
	}

	onTimelineInvisible(callback: TimelineCallback<T>) {
		this.onTimelineInvisibleCallback = callback;
		return this;
	}

	setPosition(position: number) {
		const normalized = position < 0 ? 0 : (position > 1 ? 1 : position);
		this.value = this.easingFunction(normalized);
		this.updateAllValues();
	}

	updateAllValues(delta: number = 0) {
		if (this.value === this._previousUpdateValue) {
			return;
		}

		const len = this._propKeys.length;
		const keys = this._propKeys;
		const starts = this._propStartValues;
		const changes = this._propChangeValues;
		const val = this.value;
		const obj = this.object;

		for (let i = 0; i < len; i++) {
			// We cast through unknown to assign the calculated number to the generic property.
			// This is safe because we verified 'start' and 'end' were numbers during setup,
			// and TweenableObject ensures keys map to numbers.
			obj[keys[i]] = (starts[i] + changes[i] * val) as unknown as T[keyof T];
		}

		if (this._onUpdateCallback !== null) {
			this._onUpdateCallback(obj, val, delta);
		}

		this._previousUpdateValue = val;
	}

	invalidate() {
		this._previousUpdateValue = null;
		return this;
	}

	update(time: number) {
		if (this.startTime === null) return true;

		if (time < this.startTime) {
			return true;
		}

		if (this._onStartCallbackFired === false) {
			if (this._onStartCallback !== null) {
				this._onStartCallback(this.object);
			}
			this._onStartCallbackFired = true;
			RenderLoop.trigger();
		}

		this._elapsed = time - this.startTime;

		const normalizedElapsed = this.durationMS === 0 
			? 1 
			: (this._elapsed * this._inverseDuration);
			
		const clamped = normalizedElapsed > 1 ? 1 : normalizedElapsed;

		this.value = this.easingFunction(clamped);

		if (this._previousTime === null) {
			this._previousTime = time;
		}

		const delta = time - this._previousTime;
		this._previousTime = time;

		this.updateAllValues(delta);

		if (clamped === 1) {
			const tempStartTime = this.startTime;

			if (this._loopCount > 0) {
				if (this._onLoopCallback) {
					this._onLoopCallback(this.object, this._loopNum - this._loopCount);
				}
				this._loopCount--;
				this.restart();
			} else if (this._onCompleteCallback && this.isPlaying) {
				this._onCompleteCallback(this.object, time - this.startTime);
			}

			this.isPlaying = !(tempStartTime === this.startTime);

			return false;
		}

		return true;
	}
}
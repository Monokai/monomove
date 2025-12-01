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
	BezierLike
} from '../types.js';

interface EasingOptions {
	iterations?: number;
	cacheSize?: number;
}

export class Tween<T extends TweenableObject = TweenableObject> implements ITween {

	public durationMS: number;
	public isPlaying: boolean;
	public delayTime: number;
	public startTime: number | null;
	public easingFunction: EasingFunction;
	
	// Allow object to be null for scalar tweens
	public object: T | null; 
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

	/**
	 * Create a tween that animates properties of an object.
	 */
	constructor(object: T, duration?: number);

	/**
	 * Create a tween that calls a function with a scalar value from 0 to 1.
	 */
	constructor(callback: ScalarUpdateCallback, duration?: number);

	constructor(objectOrCallback: T | ScalarUpdateCallback, duration: number = 1) {
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
		this._propKeys = [];
		this._propStartValues = [];
		this._propChangeValues = [];

		if (typeof objectOrCallback === 'function') {
			this._targetIsFunction = true;
			this.object = null;
			this._onUpdateCallback = objectOrCallback;
			
			// Default scalar state
			this._valuesStart['value'] = 0; 
			// Fix: Double cast to satisfy Partial<T> constraint
			this._valuesEnd = { value: 1 } as unknown as Partial<T>; 

		} else {
			this._targetIsFunction = false;
			this.object = objectOrCallback; 
			this._onUpdateCallback = null;
			this._valuesEnd = {};
			
			// Cast to Record to iterate safely
			const obj = this.object as Record<string, number>;
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
			const props = properties as Record<string, number>;
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
				if (typeof val === 'number' && this.object) {
					// Fix: Cast object to Record to allow assignment
					(this.object as Record<string, number>)[key] = val;
					this._valuesStart[key] = val;
				}
			}
		}

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

		this._valuesEnd = properties;
		return this;
	}

	duration(duration: number) {
		this.durationMS = duration * 1000;
		this._inverseDuration = this.durationMS > 0 ? 1 / this.durationMS : 0;
		return this;
	}

	rewind() {
		if (!this._targetIsFunction && this.object) {
			const obj = this.object as Record<string, number>;
			for (const key in this._valuesStart) {
				// Fix: Cast object to Record to allow assignment
				obj[key] = this._valuesStart[key];
			}
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

		this._propKeys.length = 0;
		this._propStartValues.length = 0;
		this._propChangeValues.length = 0;

		// Auto-populate end values if empty (Object mode only)
		if (!this._targetIsFunction && this.object) {
			let hasEndValues = false;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			for (const _ in this._valuesEnd) { hasEndValues = true; break; }

			if (!hasEndValues) {
				 const obj = this.object as Record<string, number>;
				 for (const key in obj) {
					 if (key in this._valuesStart) {
						 const val = obj[key];
						 if (typeof val === 'number') {
							// Fix: Double cast to allow assignment to generic Partial
							(this._valuesEnd as Record<string, number>)[key] = val;
						 }
					 }
				 }
			}
		}

		for (const key in this._valuesEnd) {
			const end = this._valuesEnd[key];
			
			let start = this._valuesStart[key];

			// If start missing, check object
			if (!this._targetIsFunction && start === undefined && this.object) {
				const obj = this.object as Record<string, number>;
				const currentVal = obj[key];
				if (typeof currentVal === 'number') {
					start = currentVal;
					this._valuesStart[key] = start;
				}
			}
			
			if (this._targetIsFunction && start === undefined) {
				start = 0;
			}

			// Fix: Check end type explicitly as number to allow math
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
		if (!_easing) return this;

		if (typeof _easing === 'string') {
			const cached = TweenManager.getEasingFromCache(_easing);
			if (iterations && cached.setIterations) cached.setIterations(iterations);
			if (cacheSize && cached.setCacheSize) cached.setCacheSize(cacheSize);
			this.easingFunction = cached.get.bind(cached);
		} else if (typeof _easing === 'object' && _easing !== null && 'get' in _easing) {
			const bezier = _easing as BezierLike;
			if (iterations && bezier.setIterations) bezier.setIterations(iterations);
			if (cacheSize && bezier.setCacheSize) bezier.setCacheSize(cacheSize);
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

		if (this._targetIsFunction) {
			// Function Mode
			if (this._propStartValues.length > 0) {
				const start = this._propStartValues[0];
				const change = this._propChangeValues[0];
				const val = start + change * this.value;
				
				if (this._onUpdateCallback) {
					(this._onUpdateCallback as ScalarUpdateCallback)(val, this.value, delta);
				}
			}
		} else {
			// Object Mode
			const len = this._propKeys.length;
			const keys = this._propKeys;
			const starts = this._propStartValues;
			const changes = this._propChangeValues;
			const val = this.value;
			// Use non-null assertion or strict check logic
			const obj = this.object as Record<string, number>; 

			for (let i = 0; i < len; i++) {
				// Fix: Cast key to string to index Record safely
				obj[keys[i] as string] = starts[i] + changes[i] * val;
			}

			if (this._onUpdateCallback) {
				// Cast this.object back to T for the callback
				(this._onUpdateCallback as ObjectUpdateCallback<T>)(this.object!, val, delta);
			}
		}

		this._previousUpdateValue = this.value;
	}

	invalidate() {
		this._previousUpdateValue = null;
		return this;
	}

	update(time: number): boolean {
		if (this.startTime === null) return true;

		if (time < this.startTime) {
			return true;
		}

		if (this._onStartCallbackFired === false) {
			if (this._onStartCallback !== null && this.object) {
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
				if (this._onLoopCallback && this.object) {
					this._onLoopCallback(this.object, this._loopNum - this._loopCount);
				}
				this._loopCount--;
				this.restart();
			} else if (this._onCompleteCallback && this.isPlaying && this.object) {
				this._onCompleteCallback(this.object, time - this.startTime);
			}

			const restarted = tempStartTime !== this.startTime;
			this.isPlaying = restarted || (this.isPlaying && normalizedElapsed < 1);

			return this.isPlaying;
		}

		return true;
	}
}
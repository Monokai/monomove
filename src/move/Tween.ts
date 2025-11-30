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

// Utility type to safely access properties of T when we know they are numbers (from TweenableObject constraint)
type TweenValues<T> = Record<keyof T, number>;

export default class Tween<T extends TweenableObject = TweenableObject> implements ITween {

	durationMS: number;
	isPlaying: boolean;
	delayTime: number;
	startTime: number | null;
	easingFunction: EasingFunction;
	object: T;
	value: number;
	
	onTimelineInCallback: TimelineCallback<T> | null = null;
	onTimelineOutCallback: TimelineCallback<T> | null = null;
	onTimelineVisibleCallback: TimelineCallback<T> | null = null;
	onTimelineInvisibleCallback: TimelineCallback<T> | null = null;
	
	timelineIn = false;
	previousTimelineIn = false;
	timelineVisible = false;
	previousTimelineVisible = false;

	#onUpdateCallback: UpdateCallback<T> | null;
	#valuesEnd: Partial<T>;
	#valuesEndEntries: (string | number)[];
	#loopNum: number;
	#loopCount: number;
	#onLoopCallback: LoopCallback<T> | null;
	#onCompleteCallback: CompleteCallback<T> | null;
	#onStartCallback: StartCallback<T> | null;
	#onStartCallbackFired: boolean;
	#previousTime: number | null;
	#elapsed: number;
	#valuesStart: Record<string, number>;
	#previousUpdateValue: number | null;

	constructor(object: T | UpdateCallback<T> = {} as T, duration: number = 1) {
		if (typeof object === 'function' && duration !== undefined) {
			// If function is passed, we simulate a dummy object { value: 0 }
			this.object = {
				value: 0
			} as unknown as T;

			this.#onUpdateCallback = object as unknown as UpdateCallback<T>;

			this.#valuesEnd = {
				value: 1
			} as unknown as Partial<T>;

			this.durationMS = duration * 1000;

			this.#valuesStart = {
				value: 0
			};

			// Safely access 'value' from valuesEnd, asserting structure
			this.#valuesEndEntries = ['value', (this.#valuesEnd as Record<string, number>)['value']];
		} else {
			this.object = object as T;
			this.#valuesEnd = {};
			this.#onUpdateCallback = null;
			this.durationMS = duration * 1000;

			this.#valuesStart = {};
			this.#valuesEndEntries = [];
		}

		this.easingFunction = k => k;
		this.value = 0;
		this.delayTime = 0;
		this.isPlaying = false;
		this.startTime = null;

		this.#loopNum = 0;
		this.#loopCount = 0;
		this.#onLoopCallback = null;
		this.#onCompleteCallback = null;
		this.#onStartCallback = null;
		this.#onStartCallbackFired = false;
		this.#previousTime = null;
		this.#elapsed = 0;
		this.#previousUpdateValue = null;

		// Initialize start values
		Object.keys(this.object).forEach(key => {
			const val = this.object[key];
			if (typeof val === 'number') {
				this.#valuesStart[key] = val;
			}
		});
	}

	from(properties: Partial<T>) {
		Object.keys(properties).forEach(key => {
			const val = properties[key];
			if (typeof val === 'number') {
				// Asserting val is correct type for T[keyof T] which is number
				this.object[key as keyof T] = val as T[keyof T];
			}
		});

		if (this.#onUpdateCallback !== null) {
			this.#onUpdateCallback(this.object, this.value, 0);
		}

		return this;
	}

	to(properties: Partial<T>, duration?: number) {
		if (duration !== undefined) {
			this.durationMS = duration * 1000;
		}

		this.#valuesEnd = properties;
		this.#valuesEndEntries.length = 0;

		return this;
	}

	duration(duration: number) {
		this.durationMS = duration * 1000;

		return this;
	}

	rewind() {
		Object.keys(this.object).forEach(key => {
			if (key in this.#valuesStart) {
				this.object[key as keyof T] = this.#valuesStart[key] as T[keyof T];
			}
		});

		this.value = this.easingFunction(0);

		return this;
	}

	restart() {
		return this.rewind().start();
	}

	loop(num: number = Infinity) {
		this.#loopNum = num;
		this.#loopCount = num;

		return this;
	}

	setLoopCallback(callback: LoopCallback<T>) {
		this.#onLoopCallback = callback;
		return this;
	}

	startTween(time: number = RenderLoop.getTime()) {
		const wasPlaying = this.isPlaying;

		this.#elapsed = 0;
		this.#onStartCallbackFired = false;

		this.isPlaying = true;
		this.startTime = time + this.delayTime;

		if (this.#valuesEndEntries.length === 0) {
			Object.keys(this.#valuesEnd).forEach(key => {
				const k = key as keyof T;
				const v = this.#valuesEnd[k];
				if (typeof v === 'number') {
					// We know this.object[k] is a number because T extends TweenableObject
					this.#valuesStart[key] = this.object[k] as number;
					this.#valuesEndEntries.push(key, v);
				}
			});
		}

		if (this.durationMS === 0 && this.#loopNum === 0 && this.delayTime === 0) {
			this.update(time);
			this.isPlaying = false;
		} else if (!wasPlaying) {
			TweenManager.add(this);
			RenderLoop.triggerAnimation();
		}

		return this;
	}

	start(time?: number): Promise<this> {
		const onComplete = this.#onCompleteCallback;

		return new Promise(resolve => {
			this.#onCompleteCallback = (obj, t) => {
				if (onComplete) {
					onComplete(obj, t);
				}

				this.#onCompleteCallback = onComplete;

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

	easing(_easing: EasingType = k => k, {
		iterations = TweenManager.bezierIterations ?? undefined,
		cacheSize = TweenManager.bezierCacheSize ?? undefined
	}: EasingOptions = {}) {
		let easing: EasingType = _easing;

		if (!easing) {
			return this;
		}

		if (typeof easing === 'string') {
			easing = TweenManager.getEasingFromCache(easing);
		}

		// Check if easing is a BezierLike object (has get method)
		// using a type guard or check
		if (typeof easing === 'object' && easing !== null && 'get' in easing) {
			const bezier = easing as BezierLike;
			if (iterations && bezier.setIterations) {
				bezier.setIterations(iterations);
			}

			if (cacheSize && bezier.setCacheSize) {
				bezier.setCacheSize(cacheSize);
			}

			this.easingFunction = bezier.get.bind(bezier);
		} else {
			this.easingFunction = easing as EasingFunction;
		}

		return this;
	}

	onStart(callback: StartCallback<T>) {
		this.#onStartCallback = callback;

		return this;
	}

	onUpdate(callback: UpdateCallback<T>) {
		this.#onUpdateCallback = callback;

		return this;
	}

	onComplete(callback: CompleteCallback<T> | null = null) {
		this.#onCompleteCallback = callback;

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
		const normalized = Math.max(0, Math.min(1, position));
		this.value = this.easingFunction(normalized);
		this.updateAllValues();
	}

	updateAllValues(delta: number = 0) {
		if (this.value === this.#previousUpdateValue) {
			return;
		}

		for (let i = 0; i < this.#valuesEndEntries.length; i += 2) {
			this.#updateValue(this.#valuesEndEntries[i] as string, this.#valuesEndEntries[i + 1] as number);
		}

		if (this.#onUpdateCallback !== null) {
			this.#onUpdateCallback(this.object, this.value, delta);
		}

		this.#previousUpdateValue = this.value;
	}

	invalidate() {
		this.#previousUpdateValue = null;

		return this;
	}

	#updateValue(key: string, value: number) {
		const start = this.#valuesStart[key];

		// Safe casting to number/T[keyof T] because we know the structure of T
		this.object[key as keyof T] = (start + (value - start) * this.value) as T[keyof T];
	}

	update(time: number) {
		if (this.startTime === null) return true;

		if (time < this.startTime) {
			return true;
		}

		if (this.#onStartCallbackFired === false) {
			if (this.#onStartCallback !== null) {
				this.#onStartCallback(this.object);
			}

			this.#onStartCallbackFired = true;
			RenderLoop.trigger();
		}

		this.#elapsed = time - this.startTime;

		const normalizedElapsed = this.durationMS === 0 ? 1 : Math.min(this.#elapsed / this.durationMS, 1);

		this.value = this.easingFunction(normalizedElapsed);

		if (this.#previousTime === null) {
			this.#previousTime = time;
		}

		const delta = time - this.#previousTime;

		this.#previousTime = time;

		this.updateAllValues(delta);

		if (normalizedElapsed === 1) {
			const tempStartTime = this.startTime;

			if (this.#loopCount > 0) {
				if (this.#onLoopCallback) {
					this.#onLoopCallback(this.object, this.#loopNum - this.#loopCount);
				}

				this.#loopCount--;
				this.restart();
			} else if (this.#onCompleteCallback && this.isPlaying) {
				this.#onCompleteCallback(this.object, time - this.startTime);
			}

			this.isPlaying = !(tempStartTime === this.startTime);

			return false;
		}

		return true;
	}

}
import { TweenManager } from './TweenManager.js';

type RenderCallback = (ms: number) => boolean | void;
type CleanupCallback = () => void;

export class RenderLoop {

	// Structure of Arrays (SoA) for better cache locality and reduced object allocation
	// We allow nulls internally to handle safe removals during iteration
	private static _subscribers: (RenderCallback | null)[] = [];
	private static _cleanups: (CleanupCallback | null)[] = [];
	
	private static _isUpdating = false;
	private static _activeCount = 0;

	private static _ms = 0;
	private static _time = 0;
	private static _previousTime = 0;
	
	private static _pauseTime = 0;
	private static _pauseTimeStart = 0;
	
	private static _isAnimating = false;
	private static _requestAnimation = false;
	private static _requestID = 0;
	private static _onlyHasDelayedTweens = false;
	private static _isFirstTime = true;

	// Pre-bound handler to avoid creating closures every frame
	private static _loopHandler = RenderLoop._animate.bind(RenderLoop);

	private static _animate() {
		const now = window.performance.now();
		this._time = now - this._pauseTime;
		this._ms = this._previousTime ? this._time - this._previousTime : 0;

		const hasTweens = TweenManager.onTick(this._time);

		this._isUpdating = true;
		let dirtyCount = 0;

		// Iterate current subscribers
		// We use the array length directly. New additions during this loop 
		// are pushed to the end and handled in the next frame naturally.
		const len = this._subscribers.length;
		const subs = this._subscribers;

		for (let i = 0; i < len; i++) {
			const sub = subs[i];
			// Skip nulls (items removed during this tick)
			if (sub !== null) {
				if (sub(this._ms) === true) {
					dirtyCount++;
				}
			}
		}

		if (!this._onlyHasDelayedTweens) {
			const cleanups = this._cleanups;
			for (let i = 0; i < len; i++) {
				// Check parallel array for cleanup and ensure subscriber wasn't removed (null)
				const cleanup = cleanups[i];
				if (cleanup !== null && subs[i] !== null) {
					cleanup();
				}
			}
		}

		this._isUpdating = false;

		// Cleanup nulls if any removals happened
		if (this._activeCount < subs.length) {
			this._compact();
		}

		this._onlyHasDelayedTweens = (dirtyCount === 0) && TweenManager.onlyHasDelayedTweens(this._time);
		this._previousTime = this._time;

		if (this._isAnimating && (dirtyCount > 0 || hasTweens)) {
			this._requestID = window.requestAnimationFrame(this._loopHandler);
		} else {
			this._requestAnimation = false;
		}
	}

	private static _compact() {
		let writePtr = 0;
		const len = this._subscribers.length;
		const subs = this._subscribers;
		const cleanups = this._cleanups;

		for (let i = 0; i < len; i++) {
			const sub = subs[i];
			if (sub !== null) {
				if (i !== writePtr) {
					subs[writePtr] = sub;
					cleanups[writePtr] = cleanups[i];
				}
				writePtr++;
			}
		}

		subs.length = writePtr;
		cleanups.length = writePtr;
		this._activeCount = writePtr;
	}

	public static stop(callback?: () => void) {
		this._isAnimating = false;
		window.cancelAnimationFrame(this._requestID);

		if (callback) {
			callback();
		}
	}

	public static add(callback: RenderCallback, cleanUp?: CleanupCallback) {
		this._subscribers.push(callback);
		this._cleanups.push(cleanUp || null);
		this._activeCount++;
		this.trigger();
	}

	public static reset() {
		this._subscribers.length = 0;
		this._cleanups.length = 0;
		this._activeCount = 0;
		TweenManager.removeAll();
	}

	public static remove(callback: RenderCallback) {
		const index = this._subscribers.indexOf(callback);
		
		if (index !== -1) {
			if (this._isUpdating) {
				// Soft remove: nullify slot to preserve indices during iteration
				this._subscribers[index] = null;
				this._cleanups[index] = null;
				this._activeCount--;
			} else {
				// Hard remove
				this._subscribers.splice(index, 1);
				this._cleanups.splice(index, 1);
				this._activeCount--;
			}
		}
		
		this.trigger();
	}

	public static trigger() {
		this._onlyHasDelayedTweens = false;

		if (this._requestAnimation) {
			return;
		}

		this._requestAnimation = true;
		this._requestID = window.requestAnimationFrame(this._loopHandler);
	}

	public static getTime() {
		this._time = window.performance.now() - this._pauseTime;
		return this._time;
	}

	public static pause() {
		if (!this._isAnimating) {
			return;
		}

		this._pauseTimeStart = window.performance.now();
		this._requestAnimation = false;
		this.stop();
	}

	public static play() {
		if (this._isAnimating) {
			return;
		}

		if (!this._isFirstTime) {
			this._pauseTime += window.performance.now() - this._pauseTimeStart;
		}

		this._isFirstTime = false;
		this.triggerAnimation();
	}

	public static triggerAnimation() {
		this._isAnimating = true;
		this.trigger();
	}

	public static isPlaying() {
		return this._isAnimating;
	}
}
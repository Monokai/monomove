import { TweenManager } from './TweenManager.js';

type RenderCallback = (ms: number) => boolean | void;

const isBrowser = typeof window !== 'undefined';

export class RenderLoop {
	private static _subscribers: (RenderCallback | null)[] = [];
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
	private static _isFirstTime = true;
	private static _loopHandler = RenderLoop._animate.bind(RenderLoop);

	private static _animate() {
		if (!isBrowser) {
			return;
		}

		const now = window.performance.now();

		this._time = now - this._pauseTime;

		if (this._isFirstTime) {
			this._ms = 0;
			this._isFirstTime = false;
		} else {
			this._ms = this._time - this._previousTime;
		}

		if (this._ms < 0) {
			this._ms = 0;
		}

		const hasTweens = TweenManager.onTick(this._time);
		const len = this._subscribers.length;
		const subs = this._subscribers;

		let dirtyCount = 0;

		this._isUpdating = true;

		for (let i = 0; i < len; i++) {
			const sub = subs[i];

			if (sub !== null) {
				if (sub(this._ms) !== false) {
					dirtyCount++;
				}
			}
		}

		this._isUpdating = false;

		if (this._activeCount < subs.length) {
			this._compact();
		}

		this._previousTime = this._time;

		// Keep loop running if active or if we have tweens
		if (this._isAnimating && (dirtyCount > 0 || hasTweens)) {
			this._requestID = window.requestAnimationFrame(this._loopHandler);
			this._requestAnimation = true;
		} else {
			this._requestAnimation = false;
		}
	}

	private static _compact() {
		let writePtr = 0;

		const len = this._subscribers.length;
		const subs = this._subscribers;

		for (let i = 0; i < len; i++) {
			const sub = subs[i];

			if (sub !== null) {
				if (i !== writePtr) {
					subs[writePtr] = sub;
				}
				writePtr++;
			}
		}

		subs.length = writePtr;

		this._activeCount = writePtr;
	}

	public static stop(callback?: () => void) {
		this._isAnimating = false;

		if (isBrowser) {
			window.cancelAnimationFrame(this._requestID);
		}

		this._requestAnimation = false;

		if (callback) {
			callback();
		}
	}

	public static add(callback: RenderCallback) {
		this._subscribers.push(callback);
		this._activeCount++;

		this.trigger();
	}

	public static reset() {
		this._subscribers.length = 0;
		this._activeCount = 0;

		TweenManager.removeAll();

		this.stop();

		this._ms = 0;
		this._time = 0;
		this._previousTime = 0;
		this._pauseTime = 0;
		this._pauseTimeStart = 0;
		this._isAnimating = false;
		this._requestAnimation = false;
		this._requestID = 0;
		this._isFirstTime = true;
	}

	public static remove(callback: RenderCallback) {
		const index = this._subscribers.indexOf(callback);

		if (index !== -1) {
			if (this._isUpdating) {
				this._subscribers[index] = null;
				this._activeCount--;
			} else {
				this._subscribers.splice(index, 1);
				this._activeCount--;
			}
		}

		this.trigger();
	}

	public static trigger() {
		if (!isBrowser || this._requestAnimation) {
			return;
		}

		// When waking up from idle, sync time to prevent huge deltas
		if (!this._isFirstTime) {
			this._previousTime = this.getTime();
		}

		this._requestAnimation = true;
		this._requestID = window.requestAnimationFrame(this._loopHandler);
	}

	public static getTime() {
		return isBrowser ? window.performance.now() - this._pauseTime : 0;
	}

	public static pause() {
		if (!this._isAnimating || !isBrowser) {
			return;
		}

		this._pauseTimeStart = window.performance.now();
		this._requestAnimation = false;
		this._isAnimating = false;

		window.cancelAnimationFrame(this._requestID);
	}

	public static play() {
		if (this._isAnimating || !isBrowser) {
			return;
		}

		if (!this._isFirstTime) {
			this._pauseTime += window.performance.now() - this._pauseTimeStart;
		}

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

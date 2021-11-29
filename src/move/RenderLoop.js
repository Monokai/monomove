import './RAF';
import TweenManager from './TweenManager';

export default class RenderLoop {

	static #callbacks = [];
	static #cleanUps = [];
	static #dirtyCallbacks = 0;
	static #isAnimating = true;
	static #ms = 0;
	static #pauseTime = 0;
	static #pauseTimeStart = 0;
	static #previousTime = 0;
	static #requestAnimation = true;
	static #requestID = 0;
	static #time = 0;
	static #onlyHasDelayedTweens = false;
	static #performance = window.performance;

	static staticConstructor() {
		if (!this.#performance?.now) {
			const offset = this.#performance.timing && this.#performance.timing.navigationStart ? this.#performance.timing.navigationStart : Date.now();

			this.#performance.now = function now() {
				return Date.now() - offset;
			};
		}

		this.#animate();
	}

	static #tick(callback) {
		if (callback.isPlaying) {
			const isDirty = callback.funk.call(callback.context, this.#ms);

			if (isDirty) {
				this.#dirtyCallbacks++;
			}
		}
	}

	static #cleanUpFunk(callback) {
		if (callback.isPlaying) {
			callback.cleanUp.call(callback.context);
		}
	}

	static #animate() {
		const animationLoop = () => {
			this.#time = this.#performance.now() - this.#pauseTime;
			this.#ms = this.#previousTime ? this.#time - this.#previousTime : 0;

			const hasTweens = TweenManager.onTick(this.#time);

			this.#dirtyCallbacks = 0;

			if (this.#isAnimating && !this.#onlyHasDelayedTweens) {
				this.#callbacks.forEach(this.#tick, this);
			}

			if (this.#isAnimating && (this.#dirtyCallbacks > 0 || hasTweens)) {
				this.#requestID = window.requestAnimationFrame(animationLoop);
			} else {
				// console.log('stop rendering', this.#isAnimating, this.#dirtyCallbacks, hasTweens);
				this.#requestAnimation = false;
			}

			if (!this.#onlyHasDelayedTweens) {
				this.#cleanUps.forEach(RenderLoop.#cleanUpFunk, this);
			}

			this.#onlyHasDelayedTweens = this.#dirtyCallbacks === 0 && TweenManager.onlyHasDelayedTweens(this.#time);
			this.#previousTime = this.#time;
		};

		animationLoop();
	}

	static stop(callback) {
		this.#isAnimating = false;

		window.cancelAnimationFrame(this.#requestID);

		if (callback) {
			callback();
		}

		this.trigger();
	}

	static add(context, funk, cleanUp) {
		const o = {
			context,
			funk,
			cleanUp,
			isPlaying: true
		};

		this.#callbacks.push(o);

		if (o.cleanUp) {
			this.#cleanUps.push(o);
		}

		this.trigger();
	}

	static reset() {
		this.#callbacks.length = 0;
		this.#cleanUps.length = 0;

		TweenManager.removeAll();
	}

	static remove(context, funk) {
		const filter = f => !(f.context === context && (funk ? f.funk === funk : true));

		this.#callbacks = this.#callbacks.filter(filter);
		this.#cleanUps = this.#cleanUps.filter(filter);

		this.trigger();
	}

	static trigger() {
		this.#onlyHasDelayedTweens = false;

		if (this.#requestAnimation) {
			return;
		}

		this.#requestAnimation = true;
		this.#requestID = window.requestAnimationFrame(this.#animate.bind(this));
	}

	static getTime() {
		this.#time = this.#performance.now() - this.#pauseTime;

		return this.#time;
	}

}

RenderLoop.staticConstructor();

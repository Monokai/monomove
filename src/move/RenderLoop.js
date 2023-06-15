import TweenManager from './TweenManager.js';

export default class RenderLoop {

	static #callbacks = [];
	static #cleanUps = [];
	static #dirtyCallbacks = 0;
	static #isAnimating = false;
	static #ms = 0;
	static #pauseTime = 0;
	static #pauseTimeStart = 0;
	static #previousTime = 0;
	static #requestAnimation = false;
	static #requestID = 0;
	static #time = 0;
	static #onlyHasDelayedTweens = false;
	// static #isFirstTime = true;

	static #animate() {
		const animationLoop = () => {
			this.#time = window.performance.now() - this.#pauseTime;
			this.#ms = this.#previousTime ? this.#time - this.#previousTime : 0;

			const hasTweens = TweenManager.onTick(this.#time);

			this.#dirtyCallbacks = 0;

			if (this.#isAnimating && !this.#onlyHasDelayedTweens) {
				for (let i = 0; i < this.#callbacks.length; i++) {
					const callback = this.#callbacks[i];

					if (callback.isPlaying) {
						const isDirty = callback.funk.call(callback.context, this.#ms);

						if (isDirty) {
							this.#dirtyCallbacks++;
						}
					}
				}
			}

			if (this.#isAnimating && (this.#dirtyCallbacks > 0 || hasTweens)) {
				this.#requestID = window.requestAnimationFrame(animationLoop);
			} else {
				// console.log('stop rendering', this.#isAnimating, this.#dirtyCallbacks, hasTweens);
				this.#requestAnimation = false;
			}

			if (!this.#onlyHasDelayedTweens) {
				for (let i = 0; i < this.#cleanUps.length; i++) {
					const callback = this.#cleanUps[i];

					if (callback.isPlaying) {
						callback.cleanUp.call(callback.context);
					}
				}
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
		this.#time = window.performance.now() - this.#pauseTime;

		return this.#time;
	}

	static pause() {
		if (!this.#isAnimating) {
			return;
		}

		this.#pauseTimeStart = window.performance.now();
		this.#requestAnimation = false;

		this.stop();
	}

	static play() {
		if (this.#isAnimating) {
			return;
		}

		// if (!this.#isFirstTime) {
		this.#pauseTime += window.performance.now() - this.#pauseTimeStart;
		// }

		this.#isAnimating = true;

		this.trigger();

		// this.#isFirstTime = false;
	}

	static isPlaying() {
		return this.#isAnimating;
	}

}

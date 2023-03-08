import CubicBezier from '../math/CubicBezier.js';

export default class {

	static #tweens = [];
	static #deadTweens = [];
	static #time = 0;
	static #easingCache = new Map();

	static bezierIterations = null;
	static bezierCacheSize = null;

	static getAll() {
		return this.#tweens;
	}

	static removeAll() {
		this.#tweens.forEach(tween => {
			tween.isPlaying = false;
		});

		this.#tweens.length = 0;
		this.#easingCache = new Map();
	}

	static add(tween) {
		this.#tweens.push(tween);
	}

	static remove(tween) {
		const i = this.#tweens.indexOf(tween);

		if (i !== -1) {
			this.#tweens.splice(i, 1);
		}
	}

	static #removeDeadTween(tween) {
		if (!tween.isPlaying) {
			this.remove(tween);
		}
	}

	static #updateTween(tween) {
		if (!tween.update(this.#time)) {
			this.#deadTweens.push(tween);
		}
	}

	static onlyHasDelayedTweens(time) {
		return this.#tweens.length > 0 && this.#tweens.every(t => time < t.startTime);
	}

	static onTick(time) {
		if (this.#tweens.length === 0) {
			return false;
		}

		this.#time = time;

		this.#deadTweens.length = 0;

		this.#tweens.forEach(this.#updateTween, this);
		this.#deadTweens.forEach(this.#removeDeadTween, this);

		return true;
	}

	static setBezierIterations(x) {
		this.bezierIterations = x;
	}

	static setBezierCacheSize(x) {
		this.bezierCacheSize = x;
	}

	static getEasingFromCache(key) {
		if (!this.#easingCache.has(key)) {
			this.#easingCache.set(key, new CubicBezier(key));
		}

		return this.#easingCache.get(key);
	}

}

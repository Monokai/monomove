import CubicBezier from '../math/CubicBezier.js';
import type { ITween } from '../types.js';

export default class TweenManager {

	static #tweens: ITween[] = [];
	static #deadTweens: ITween[] = [];
	static #time = 0;
	static #easingCache = new Map<string, CubicBezier>();

	static bezierIterations: number | null = null;
	static bezierCacheSize: number | null = null;

	static getAll() {
		return this.#tweens;
	}

	static removeAll() {
		this.#tweens.forEach(tween => {
			tween.stop();
		});

		this.#tweens.length = 0;
		this.#easingCache.clear();
	}

	static add(tween: ITween) {
		this.#tweens.push(tween);
	}

	static remove(tween: ITween) {
		const i = this.#tweens.indexOf(tween);

		if (i !== -1) {
			this.#tweens.splice(i, 1);
		}
	}

	static #removeTween(tween: ITween) {
		this.remove(tween);
	}

	static #updateTween(tween: ITween) {
		if (!tween.update(this.#time)) {
			this.#deadTweens.push(tween);
		}
	}

	static onlyHasDelayedTweens(time: number) {
		return this.#tweens.length > 0 && this.#tweens.every(t => t.startTime !== null && time < t.startTime);
	}

	static onTick(time: number) {
		if (this.#tweens.length === 0) {
			return false;
		}

		this.#time = time;

		this.#tweens.forEach(t => this.#updateTween(t));
		
		if (this.#deadTweens.length > 0) {
			this.#deadTweens.forEach(t => this.#removeTween(t));
			this.#deadTweens.length = 0;
		}

		return true;
	}

	static setBezierIterations(x: number) {
		this.bezierIterations = x;
	}

	static setBezierCacheSize(x: number) {
		this.bezierCacheSize = x;
	}

	static getEasingFromCache(key: string) {
		if (!this.#easingCache.has(key)) {
			this.#easingCache.set(key, new CubicBezier(key));
		}

		return this.#easingCache.get(key) as CubicBezier;
	}

}
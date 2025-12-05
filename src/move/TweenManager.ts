import { CubicBezier } from '../math/CubicBezier.js';
import type { BezierLike, EasingOptions, ITween } from '../types.js';

export class TweenManager {
	private static _tweens: (ITween | null)[] = [];
	private static _easingCache = new Map<string, CubicBezier>();
	private static _isUpdating = false;

	public static bezierIterations: number | null = null;
	public static bezierCacheSize: number | null = null;
	public static bezierPrecision: number | null = null;
	public static bezierNewtonRaphsonMinSlope: number | null = null;
	public static bezierSubdivisionPrecision: number | null = null;
	public static bezierSubdivisionIterations: number | null = null;

	public static getAll(): ITween[] {
		const result: ITween[] = [];
		const len = this._tweens.length;

		for (let i = 0; i < len; i++) {
			const t = this._tweens[i];

			if (t !== null) result.push(t);
		}

		return result;
	}

	public static removeAll() {
		const len = this._tweens.length;

		for (let i = 0; i < len; i++) {
			this._tweens[i]?.stop();
		}

		this._tweens.length = 0;
		this._easingCache.clear();
	}

	public static add(tween: ITween) {
		this._tweens.push(tween);
	}

	public static remove(tween: ITween) {
		const index = this._tweens.indexOf(tween);

		if (index !== -1) {
			if (this._isUpdating) {
				this._tweens[index] = null;
			} else {
				this._tweens.splice(index, 1);
			}
		}
	}

	public static onTick(time: number): boolean {
		const tweens = this._tweens;
		const initialLen = tweens.length;

		if (initialLen === 0) {
			return false;
		}

		this._isUpdating = true;

		let activeCount = 0;

		for (let i = 0; i < initialLen; i++) {
			const tween = tweens[i];

			if (tween !== null && tween.update(time)) {
				if (i !== activeCount) {
					tweens[activeCount] = tween;
				}

				activeCount++;
			}
		}

		this._isUpdating = false;

		const finalLen = tweens.length;

		if (finalLen > initialLen) {
			for (let i = initialLen; i < finalLen; i++) {
				tweens[activeCount++] = tweens[i];
			}
		}

		tweens.length = activeCount;

		return activeCount > 0;
	}

	public static getEasingFromCache(key: string) {
		if (!this._easingCache.has(key)) {
			this._easingCache.set(key, new CubicBezier(key));
		}

		return this._easingCache.get(key) as CubicBezier;
	}

	public static setEasingOptions(
		bezier: CubicBezier | BezierLike,
		easingOptions: EasingOptions = {}
	) {
		const defaults = {
			iterations: TweenManager.bezierIterations,
			cacheSize: TweenManager.bezierCacheSize,
			precision: TweenManager.bezierPrecision,
			newtonRaphsonMinSlope: TweenManager.bezierNewtonRaphsonMinSlope,
			subdivisionPrecision: TweenManager.bezierSubdivisionPrecision,
			subdivisionIterations: TweenManager.bezierSubdivisionIterations,
			...easingOptions
		};

		const keys = Object.keys(defaults) as (keyof typeof defaults)[];

		for (const key of keys) {
			const value = defaults[key];

			if (value !== null) {
				bezier[key] = value;
			}
		}
	}
}

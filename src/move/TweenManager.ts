import { CubicBezier } from '../math/CubicBezier.js';
import type { BezierLike, EasingOptions, ITween } from '../types.js';

const tweens: (ITween | null)[] = [];
const easingCache = new Map<string, CubicBezier>();
const presetRegistry = new Map<string, [number, number, number, number]>();

let isUpdating = false;

export const TweenManager = {
	bezierIterations: null as number | null,
	bezierCacheSize: null as number | null,
	bezierPrecision: null as number | null,
	bezierNewtonRaphsonMinSlope: null as number | null,
	bezierSubdivisionPrecision: null as number | null,
	bezierSubdivisionIterations: null as number | null,

	getAll: (): ITween[] => {
		const result: ITween[] = [];
		const len = tweens.length;

		for (let i = 0; i < len; i++) {
			const t = tweens[i];
			if (t !== null) result.push(t);
		}

		return result;
	},

	removeAll: (): void => {
		const len = tweens.length;

		for (let i = 0; i < len; i++) {
			tweens[i]?.stop();
		}

		tweens.length = 0;
		easingCache.clear();
	},

	add: (tween: ITween): void => {
		tweens.push(tween);
	},

	remove: (tween: ITween): void => {
		const index = tweens.indexOf(tween);

		if (index !== -1) {
			if (isUpdating) {
				tweens[index] = null;
			} else {
				tweens.splice(index, 1);
			}
		}
	},

	register: (name: string, values: [number, number, number, number]): void => {
		presetRegistry.set(name, values);
	},

	registerAll: (presets: Record<string, number[]>): void => {
		for (const key in presets) {
			const val = presets[key];

			if (val.length === 4) {
				presetRegistry.set(key, val as [number, number, number, number]);
			}
		}
	},

	onTick: (time: number): boolean => {
		const initialLen = tweens.length;

		if (initialLen === 0) {
			return false;
		}

		isUpdating = true;

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

		isUpdating = false;

		const finalLen = tweens.length;

		if (finalLen > initialLen) {
			for (let i = initialLen; i < finalLen; i++) {
				tweens[activeCount++] = tweens[i];
			}
		}

		tweens.length = activeCount;

		return activeCount > 0;
	},

	getEasingFromCache: (key: string): CubicBezier => {
		if (!easingCache.has(key)) {
			if (presetRegistry.has(key)) {
				const [x1, y1, x2, y2] = presetRegistry.get(key)!;

				easingCache.set(key, new CubicBezier(x1, y1, x2, y2));
			} else {
				easingCache.set(key, new CubicBezier(key));
			}
		}

		return easingCache.get(key) as CubicBezier;
	},

	setEasingOptions: (
		bezier: CubicBezier | BezierLike,
		easingOptions: EasingOptions = {}
	): void => {
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
				(bezier as BezierLike)[key] = value;
			}
		}
	}
};

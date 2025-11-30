import CubicBezier from '../math/CubicBezier.js';
import type { ITween } from '../types.js';

export default class TweenManager {

	// (ITween | null)[] allows us to nullify slots cheaply during update loops
	// without using splice, which shifts the whole array.
	private static _tweens: (ITween | null)[] = [];
	private static _time = 0;
	private static _easingCache = new Map<string, CubicBezier>();
	private static _isUpdating = false;

	public static bezierIterations: number | null = null;
	public static bezierCacheSize: number | null = null;

	public static getAll(): ITween[] {
		// Return a clean array without internal nulls for consumers
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
				// Soft remove: If currently iterating, just mark as null to avoid 
				// index shifting which breaks the update loop. 
				// The onTick compaction will clean this up.
				this._tweens[index] = null;
			} else {
				// Hard remove: If not iterating, keep the array tight immediately.
				this._tweens.splice(index, 1);
			}
		}
	}

	public static onlyHasDelayedTweens(time: number) {
		const tweens = this._tweens;
		const len = tweens.length;
		
		for (let i = 0; i < len; i++) {
			const t = tweens[i];
			if (t !== null) {
				// If a tween exists and has started (or has no start time yet), 
				// then we have active animations.
				if (t.startTime === null || time >= t.startTime) {
					return false;
				}
			}
		}
		
		// If we found tweens but none were active, true.
		// If we found no tweens at all (length 0 or all null), 
		// technically "delayed tweens" is false, but safe to say false here implies idle.
		return len > 0;
	}

	public static onTick(time: number): boolean {
		const tweens = this._tweens;
		const initialLen = tweens.length;

		if (initialLen === 0) {
			return false;
		}

		this._time = time;
		this._isUpdating = true;

		let activeCount = 0;

		// Optimization: Single-pass compaction.
		// Iterate only up to the initial length to avoid infinite loops 
		// if tweens add more tweens indefinitely.
		for (let i = 0; i < initialLen; i++) {
			const tween = tweens[i];
			
			// Check if tween is valid (not removed via null) AND is still running after update
			if (tween !== null && tween.update(time)) {
				// Tween is alive. 
				// If we have encountered dead/removed tweens before, shift this one down.
				if (i !== activeCount) {
					tweens[activeCount] = tween;
				}
				activeCount++;
			}
			// If tween is null or update() returns false, we simply don't increment activeCount,
			// effectively dropping it from the compacted list.
		}

		this._isUpdating = false;

		// Handle new tweens added *during* the loop (e.g., inside onStart/onUpdate callbacks).
		// These were pushed to the end of the array (indices >= initialLen).
		// We need to shift them down to the new end of the compacted list.
		const finalLen = tweens.length;
		if (finalLen > initialLen) {
			for (let i = initialLen; i < finalLen; i++) {
				tweens[activeCount++] = tweens[i];
			}
		}

		// Truncate the array to the count of actual active tweens
		tweens.length = activeCount;

		return true;
	}

	public static setBezierIterations(x: number) {
		this.bezierIterations = x;
	}

	public static setBezierCacheSize(x: number) {
		this.bezierCacheSize = x;
	}

	public static getEasingFromCache(key: string) {
		if (!this._easingCache.has(key)) {
			this._easingCache.set(key, new CubicBezier(key));
		}

		return this._easingCache.get(key) as CubicBezier;
	}
}
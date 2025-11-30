import AbstractTimeline, { TimelineOptions } from './AbstractTimeline.js';
import clamp from '../math/clamp.js';
import Tween from './Tween.js';
import type { ITween } from '../types.js';

export default class TweenChain extends AbstractTimeline {

	// Optimization: Structure of Arrays for fast iteration
	private _startTimes: number[];
	private _durations: number[];

	constructor(tweens: ITween[], options?: TimelineOptions) {
		super(options);

		// Flatten and populate tweens
		// We use a temporary array to accumulate delays for nested chains
		this._tweens = [];
		this._addTweens(tweens);

		// Pre-calculate timing arrays
		const count = this._tweens.length;
		this._startTimes = new Array(count);
		this._durations = new Array(count);

		let cursor = 0;
		for (let i = 0; i < count; i++) {
			const t = this._tweens[i];
			
			// Calculate duration: precedence to totalTime (Timeline) -> durationMS (Tween)
			const duration = t.totalTime !== undefined ? t.totalTime : t.durationMS;
			
			// In a Chain, the delay of an item is added to the cursor (gap)
			cursor += t.delayTime;

			this._startTimes[i] = cursor;
			this._durations[i] = duration;

			cursor += duration;
		}

		this.totalTime = cursor;
	}

	private _addTweens(candidates: ITween[]) {
		for (let i = 0; i < candidates.length; i++) {
			const t = candidates[i];
			// Recursively flatten chains/timelines if needed, 
			// OR just add them. The original code flattened them into a single linear list.
			// Here we treat nested structures as atomic ITween units unless we want to explode them.
			// The original code did: if (o instanceof this.constructor) ...
			if (t instanceof TweenChain) {
				 // Explode nested chains to keep linearity
				this._addTweens(t._tweens);
			} else {
				this._tweens.push(t);
			}
		}
	}

	public setPosition(position: number) {
		// Current global time within the timeline
		const time = clamp(position, 0, 1) * this.totalTime;
		
		const count = this._tweens.length;
		const starts = this._startTimes;
		const durations = this._durations;
		const tweens = this._tweens;

		for (let i = 0; i < count; i++) {
			const tween = tweens[i];
			const start = starts[i];
			const duration = durations[i];
			const end = start + duration;

			if (time < start) {
				// Before tween starts
				tween.setPosition(0);
				
				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, false);
					AbstractTimeline.setTweenIn(tween, false);
					tween.invalidate(); // Force update on next render if needed
					tween.updateAllValues();
				}
			} else if (time >= end) {
				// After tween ends
				tween.setPosition(1);
				
				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, true);
					AbstractTimeline.setTweenIn(tween, false);
					tween.invalidate();
					tween.updateAllValues();
				}
			} else {
				// Inside tween
				// Avoid divide by zero
				const progress = duration === 0 ? 1 : (time - start) / duration;
				const clamped = progress < 0 ? 0 : (progress > 1 ? 1 : progress);

				if (tween instanceof Tween) {
					// Apply easing here because Tween.setPosition expects a 0-1 linear value
					// and applies its own easing. Wait, the original code applies easing 
					// inside the Tween logic? 
					// Tween.setPosition(p) calls this.value = easing(p).
					// So we pass linear progress here.
					tween.setPosition(clamped);

					AbstractTimeline.setTweenVisibility(tween, true);
					AbstractTimeline.setTweenIn(tween, true);
					tween.invalidate();
					tween.updateAllValues();
				} else {
					// Nested timeline/chain
					tween.setPosition(clamped);
				}
			}
		}

		this.previousPosition = position;
	}

	public update(time?: number) {
		// Driven by internal tween, but if called manually:
		this.setPosition(this.previousPosition);
		return true;
	}
}
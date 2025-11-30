import AbstractTimeline, { TimelineOptions } from './AbstractTimeline.js';
import clamp from '../math/clamp.js';
import Tween from './Tween.js';
import type { ITween } from '../types.js';

export default class Timeline extends AbstractTimeline {

	// Optimization: Structure of Arrays
	private _startTimes: number[];
	private _durations: number[];

	constructor(tweens: ITween[], options?: TimelineOptions) {
		super(options);

		this._tweens = [];
		
		// Populate and flatten recursively
		this._addTweens(tweens, 0);

		// Sort by start time for predictable rendering order, 
		// though logic is robust regardless.
		// We need to pair start times with tweens before sorting.
		// Actually, let's keep it simple: Map tweens to a temporary structure, sort, then split.
		const items: { t: ITween; start: number; duration: number }[] = [];
		
		for (let i = 0; i < this._tweens.length; i++) {
			const t = this._tweens[i];
			const duration = t.totalTime !== undefined ? t.totalTime : t.durationMS;
			// The actual start time is the delay property on the tween itself
			// accumulated during the recursive add.
			const start = t.delayTime; 

			items.push({ t, start, duration });
		}

		// Sort by start time
		items.sort((a, b) => a.start - b.start);

		// Fill SoA
		const count = items.length;
		this._tweens = new Array(count);
		this._startTimes = new Array(count);
		this._durations = new Array(count);
		
		let maxTime = 0;

		for (let i = 0; i < count; i++) {
			this._tweens[i] = items[i].t;
			this._startTimes[i] = items[i].start;
			this._durations[i] = items[i].duration;
			
			const end = items[i].start + items[i].duration;
			if (end > maxTime) maxTime = end;
		}

		this.totalTime = maxTime;
	}

	private _addTweens(candidates: ITween[], accumulatedDelay: number) {
		for (let i = 0; i < candidates.length; i++) {
			const t = candidates[i];
			
			if (t instanceof Timeline) {
				// If it's another Timeline, flatten it into this one
				// adding the current delay to its children's delays
				this._addTweens(t._tweens, accumulatedDelay + t.delayTime);
			} else {
				// It's a Tween or a Chain (treated as a block)
				// We modify its delayTime to position it absolutely in this Timeline
				t.delayTime += accumulatedDelay;
				this._tweens.push(t);
			}
		}
	}

	public setPosition(position: number) {
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
				// Before
				tween.setPosition(0);
				
				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, false);
					AbstractTimeline.setTweenIn(tween, false);
					tween.invalidate();
					tween.updateAllValues();
				}

			} else if (time >= end) {
				// After
				tween.setPosition(1);
				
				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, true);
					AbstractTimeline.setTweenIn(tween, false);
					tween.invalidate();
					tween.updateAllValues();
				}

			} else {
				// Active
				const progress = duration === 0 ? 1 : (time - start) / duration;
				const clamped = progress < 0 ? 0 : (progress > 1 ? 1 : progress);

				if (tween instanceof Tween) {
					tween.setPosition(clamped); // Tween handles easing
					
					AbstractTimeline.setTweenVisibility(tween, true);
					AbstractTimeline.setTweenIn(tween, true);
					tween.invalidate();
					tween.updateAllValues();
				} else {
					tween.setPosition(clamped);
				}
			}
		}

		this.previousPosition = position;
	}

	public update(time?: number) {
		this.setPosition(this.previousPosition || 0);
		return true;
	}
}
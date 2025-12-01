import { AbstractTimeline, TimelineOptions } from './AbstractTimeline.js';
import { clamp } from '../math/clamp.js';
import { Tween } from './Tween.js';
import type { ITween } from '../types.js';

export class Timeline extends AbstractTimeline {

	// Structure of Arrays (SoA)
	private _startTimes: number[] = [];
	private _durations: number[] = [];
	private _cursor: number = 0; // Tracks the end of the timeline sequence

	constructor(options?: TimelineOptions) {
		super(options);
	}

	/**
	 * Adds a tween to the end of the timeline (sequentially).
	 * @param tween The tween or timeline to add
	 * @param offset Optional offset in seconds relative to the current end of the timeline. 
	 *               (e.g., -0.5 starts 0.5s before the previous tween ends).
	 */
	public add(tween: ITween, offset: number = 0): this {
		const durationMS = tween.totalTime !== undefined ? tween.totalTime : tween.durationMS;
		const offsetMS = offset * 1000;
		
		// Calculate start time based on current cursor (sequence tail)
		const startTime = this._cursor + offsetMS;
		
		this._register(tween, startTime, durationMS);

		return this;
	}

	/**
	 * Inserts a tween at a specific absolute time.
	 * @param time The absolute time in seconds to start the tween.
	 * @param tween The tween to insert.
	 */
	public at(time: number, tween: ITween): this {
		const durationMS = tween.totalTime !== undefined ? tween.totalTime : tween.durationMS;
		const startTime = time * 1000;

		this._register(tween, startTime, durationMS);

		return this;
	}

	/**
	 * Internal registration logic
	 */
	private _register(tween: ITween, startTime: number, durationMS: number) {
		// Set the tween's internal delay to position it absolutely on the timeline
		tween.delayTime = startTime;

		this._tweens.push(tween);
		this._startTimes.push(startTime);
		this._durations.push(durationMS);

		const endTime = startTime + durationMS;

		// If this new tween extends past the current sequence cursor, update the cursor.
		if (endTime > this._cursor) {
			this._cursor = endTime;
		}

		// Update the total duration of the timeline
		if (endTime > this.totalTime) {
			this.totalTime = endTime;
		}
	}

	public setPosition(position: number) {
		const time = clamp(position, 0, 1) * this.totalTime;

		// Hot loop: Iterate SoA
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
				
				// Tween.setPosition expects 0-1
				tween.setPosition(progress);

				if (tween instanceof Tween) {
					AbstractTimeline.setTweenVisibility(tween, true);
					AbstractTimeline.setTweenIn(tween, true);
					tween.invalidate();
					tween.updateAllValues();
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
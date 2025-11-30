import Tween from './Tween.js';
import type { ITween } from '../types.js';

export interface TimelineOptions {
	delay?: number;
}

interface TimelineValue {
	value: number;
	[key: string]: number; // Satisfy index signature of TweenableObject
}

export default abstract class AbstractTimeline implements ITween {

	previousPosition: number;
	
	// ITween interface properties
	startTime: number | null = null;
	delayTime: number = 0;
	durationMS: number = 0;
	value: number = 0;
	easingFunction: (t: number) => number = k => k;
	
	// Internal
	tween: Tween<TimelineValue> | null = null;
	tweens: (ITween)[] = [];
	totalTime: number = 0;

	constructor({
		delay = 0
	}: TimelineOptions = {}) {
		this.previousPosition = 0;
		this.delayTime = delay * 1000;
	}

	static setTweenIn(tween: Tween, isIn: boolean) {
		tween.timelineIn = isIn;

		if (tween.timelineIn !== tween.previousTimelineIn) {
			if (isIn && tween.onTimelineInCallback) {
				tween.onTimelineInCallback(tween.object);
			} else if (!isIn && tween.onTimelineOutCallback) {
				tween.onTimelineOutCallback(tween.object);
			}

			tween.previousTimelineIn = tween.timelineIn;
		}
	}

	static setTweenVisibility(tween: Tween, isVisible: boolean) {
		tween.timelineVisible = isVisible;

		if (tween.timelineVisible !== tween.previousTimelineVisible) {
			if (isVisible && tween.onTimelineVisibleCallback) {
				tween.onTimelineVisibleCallback(tween.object);
			} else if (!isVisible && tween.onTimelineInvisibleCallback) {
				tween.onTimelineInvisibleCallback(tween.object);
			}

			tween.previousTimelineVisible = tween.timelineVisible;
		}
	}

	// ITween method implementation
	delay(amount: number): this {
		this.delayTime = amount * 1000;
		return this;
	}

	stop() {
		this.tween?.stop();
		return this;
	}

	destroy() {
		this.stop();

		this.tweens.forEach(tween => tween.stop());
		this.tweens.length = 0;

		this.totalTime = 0;
	}

	start(): Promise<ITween> {
		// Explicitly create a tween that controls the timeline position
		this.tween = new Tween<TimelineValue>({value: 0}, this.totalTime / 1000);
		
		// Bind the update to setPosition
		this.tween.onUpdate(({value}) => {
			this.setPosition(value);
		});

		// Return the promise from the internal tween, but cast to ITween to satisfy interface
		return this.tween.start().then(() => this);
	}

	// Abstract methods that must be implemented
	abstract setPosition(position: number): void;
	abstract update(time: number): boolean;

	// Stub for ITween compliance
	updateAllValues() {}
	invalidate() {}
}
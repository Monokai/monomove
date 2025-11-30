import AbstractTimeline, { TimelineOptions } from './AbstractTimeline.js';
import clamp from '../math/clamp.js';
import Tween from './Tween.js';
import type { ITween } from '../types.js';

export default class Timeline extends AbstractTimeline {

	constructor(tweens: ITween[], options?: TimelineOptions) {
		super(options);

		this.tweens = tweens.reduce((a, o) => this.#addTween(a, o, this.delayTime / 1000), [] as ITween[]).sort((a, b) => a.delayTime - b.delayTime);
		this.totalTime = this.tweens.reduce((total, tween) => Math.max(total, tween.totalTime ? tween.totalTime : tween.delayTime + tween.durationMS), 0);
	}

	#addTween(a: ITween[], o: ITween, delay = 0) {
		if (o instanceof Timeline) {
			o.tweens.forEach(b => this.#addTween(a, b, delay + (o.delayTime / 1000)));
		} else {
			if (delay) {
				o.delayTime += delay * 1000;
			}

			a.push(o);
		}

		return a;
	}

	setPosition(position: number) {
		const time = clamp(position, 0, 1) * this.totalTime;

		// reset all tweens that start later than position
		for (let i = this.tweens.length - 1; i >= 0; i--) {
			const tween = this.tweens[i];

			if (tween.totalTime !== undefined) {
				if (tween.delayTime > time) {
					tween.setPosition(0);
				}
			} else if (tween instanceof Tween) {
				if (tween.delayTime > time) {
					tween.value = 0;

					Timeline.setTweenVisibility(tween, false);
					Timeline.setTweenIn(tween, false);

					tween.invalidate();
					tween.updateAllValues();
				} else {
					break;
				}
			}
		}

		for (let i = 0; i < this.tweens.length; i++) {
			const tween = this.tweens[i];

			if (tween.totalTime !== undefined) {
				const tweenDuration = tween.totalTime;
				const tweenTime = tween.delayTime + tweenDuration;
				const tweenStartTime = tween.delayTime;

				if (tweenTime <= time) {
					tween.setPosition(1);
				} else if (tweenStartTime <= time) {
					const normalized = clamp((time - tweenStartTime) / tweenDuration, 0, 1);

					tween.setPosition(normalized);
				} else {
					break;
				}
			} else if (tween instanceof Tween) {
				const tweenDuration = tween.durationMS;
				const tweenTime = tween.delayTime + tweenDuration;
				const tweenStartTime = tween.delayTime;

				if (tweenTime <= time) {
					tween.value = 1;

					Timeline.setTweenVisibility(tween, true);
					Timeline.setTweenIn(tween, false);
				} else if (tweenStartTime <= time) {
					const normalized = clamp((time - tweenStartTime) / tweenDuration, 0, 1);

					tween.value = tween.easingFunction(normalized);

					Timeline.setTweenVisibility(tween, true);
					Timeline.setTweenIn(tween, true);
				} else {
					break;
				}

				tween.invalidate();
				tween.updateAllValues();
			}
		}

		this.previousPosition = position;
	}

	update(time?: number) {
		this.setPosition(this.previousPosition || 0);
		return true;
	}

}
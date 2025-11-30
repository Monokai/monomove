import AbstractTimeline, { TimelineOptions } from './AbstractTimeline.js';
import clamp from '../math/clamp.js';
import Tween from './Tween.js';
import type { ITween } from '../types.js';

export default class TweenChain extends AbstractTimeline {

	constructor(tweens: (ITween)[], options?: TimelineOptions) {
		super(options);

		this.tweens = tweens.reduce((a, o, i) => this.#addTween(a, o, i === 0 ? (this.delayTime / 1000) : 0), [] as ITween[]);
		this.totalTime = this.tweens.reduce((total, tween) => total + (tween.totalTime ? tween.totalTime : tween.delayTime + tween.durationMS), 0);
	}

	#addTween(a: ITween[], o: ITween, delay = 0) {
		if (o instanceof TweenChain) {
			for (let i = 0; i < o.tweens.length; i++) {
				const tween = o.tweens[i];

				this.#addTween(a, tween, i === 0 ? (o.delayTime / 1000) : 0);
			}
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

		let t = this.totalTime;

		// reset all tweens that start later than position
		for (let i = this.tweens.length - 1; i >= 0; i--) {
			const tween = this.tweens[i];

			if (tween.totalTime !== undefined) {
				// Nested Timeline/Chain
				const tweenDuration = tween.totalTime;
				const tweenTime = tween.delayTime + tweenDuration;

				t -= tweenTime;

				const tweenStartTime = t + tween.delayTime;

				if (tweenStartTime > time) {
					tween.setPosition(0);
				}
			} else if (tween instanceof Tween) {
				// Leaf Tween
				const tweenDuration = tween.durationMS;
				const tweenTime = tween.delayTime + tweenDuration;

				t -= tweenTime;

				const tweenStartTime = t + tween.delayTime;

				if (tweenStartTime > time) {
					tween.value = 0;

					TweenChain.setTweenVisibility(tween, false);
					TweenChain.setTweenIn(tween, false);

					tween.invalidate();
					tween.updateAllValues();
				} else {
					break;
				}
			}
		}

		t = 0;

		for (let i = 0; i < this.tweens.length; i++) {
			const tween = this.tweens[i];

			if (tween.totalTime !== undefined) {
				const tweenDuration = tween.totalTime;
				const tweenTime = tween.delayTime + tweenDuration;
				const tweenStartTime = t + tween.delayTime;

				t += tweenTime;

				if (t <= time) {
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
				const tweenStartTime = t + tween.delayTime;

				t += tweenTime;

				if (t <= time) {
					tween.value = 1;

					TweenChain.setTweenVisibility(tween, true);
					TweenChain.setTweenIn(tween, false);
				} else if (tweenStartTime <= time) {
					const normalized = clamp((time - tweenStartTime) / tweenDuration, 0, 1);

					tween.value = tween.easingFunction(normalized);

					TweenChain.setTweenVisibility(tween, true);
					TweenChain.setTweenIn(tween, true);
				} else {
					break;
				}

				tween.invalidate();
				tween.updateAllValues();
			}
		}
	}

	update(time?: number) {
		this.setPosition(this.previousPosition || 0);
		return true;
	}
}
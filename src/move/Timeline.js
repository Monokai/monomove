import AbstractTimeline from './AbstractTimeline.js';
import clamp from '../math/clamp.js';

export default class Timeline extends AbstractTimeline {

	constructor(tweens, options) {
		super(options);

		this.tweens = tweens.reduce((a, o) => this.addTween(a, o, this.delay), []).sort((a, b) => a.delayTime - b.delayTime);
		this.totalTime = this.tweens.reduce((total, tween) => Math.max(total, tween.delayTime + tween.durationMS), 0);
	}

	addTween(a, o, delay = 0) {
		if (o instanceof this.constructor) {
			o.tweens.forEach(b => this.addTween(a, b, delay + o.delay));
		} else {
			if (delay) {
				o.delayTime += delay * 1000;
			}

			a.push(o);
		}

		return a;
	}

	setPosition(position) {
		const time = clamp(position, 0, 1) * this.totalTime;

		// reset all tweens that start later than position
		for (let i = this.tweens.length - 1; i >= 0; i--) {
			const tween = this.tweens[i];

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

		for (let i = 0; i < this.tweens.length; i++) {
			const tween = this.tweens[i];
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

		this.previousPosition = position;
	}

	update() {
		this.setPosition(this.previousPosition || 0);
	}

	async start() {
		await Promise.all(this.tweens.map(tween => tween.start()));
	}

}

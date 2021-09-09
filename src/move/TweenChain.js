import AbstractTimeline from './AbstractTimeline';
import clamp from '../math/clamp';

export default class TweenChain extends AbstractTimeline {

	constructor(tweens) {
		super();

		this.tweens = tweens;
		this.totalTime = tweens.reduce((total, tween) => total + tween.delayTime + tween._duration, 0);
	}

	setPosition(position) {
		const time = clamp(position, 0, 1) * this.totalTime;

		let t = this.totalTime;

		// reset all tweens that start later than position
		for (let i = this.tweens.length - 1; i >= 0; i--) {
			const tween = this.tweens[i];

			const tweenDuration = tween._duration;
			const tweenTime = tween.delayTime + tweenDuration;

			t -= tweenTime;

			const tweenStartTime = t + tween.delayTime;

			if (tweenStartTime > time) {
				tween.value = 0;

				this.setTweenVisibility(tween, false);
				this.setTweenIn(tween, false);

				tween.updateAllValues();
			} else {
				break;
			}
		}

		t = 0;

		for (const tween of this.tweens) {
			const tweenDuration = tween._duration;
			const tweenTime = tween.delayTime + tweenDuration;
			const tweenStartTime = t + tween.delayTime;

			t += tweenTime;

			if (t <= time) {
				tween.value = 1;

				this.setTweenVisibility(tween, true);
				this.setTweenIn(tween, false);
			} else if (tweenStartTime <= time) {
				const normalized = clamp((time - tweenStartTime) / tweenDuration, 0, 1);

				tween.value = tween.easingFunction(normalized);

				this.setTweenVisibility(tween, true);
				this.setTweenIn(tween, true);
			} else {
				break;
			}

			tween.updateAllValues();
		}
	}

	async start() {
		for (const tween of this.tweens) {
			await tween.start();
		}
	}

}
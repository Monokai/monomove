import clamp from '../math/clamp';

export default class Timeline {

	constructor(tweens) {
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
			const tweenStartTime = t + tween.delayTime;

			t -= tweenTime;

			if (tweenStartTime > time) {
				tween.value = 0;
				tween.updateAll();
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

			if (t < time) {
				tween.value = 1;
			} else if (tweenStartTime <= time) {
				const normalized = clamp((time - tweenStartTime) / tweenDuration, 0, 1);

				tween.value = tween.easingFunction(normalized);
			} else {
				break;
			}

			tween.updateAll();
		}
	}

	async start() {
		for (const tween of this.tweens) {
			await tween.start();
		}
	}

}
import clamp from '../math/clamp';

export default class Timeline {

	constructor(tweens) {
		this.tweens = tweens;
		this.totalTime = tweens.reduce((total, tween) => total + tween.delayTime + tween._duration, 0);
	}

	setPosition(position) {
		const time = clamp(position, 0, 1) * this.totalTime;

		let t = 0;

		for (const tween of this.tweens) {
			const tweenDuration = tween._duration;
			const tweenTime = tween.delayTime + tweenDuration;
			const tweenStartTime = t + tween.delayTime;

			t += tweenTime;

			if (t < time) {
				tween.value = 1;
				tween.updateAll();
			} else if (tweenStartTime > time) {
				tween.value = 0;
			} else {
				const normalized = clamp((time - tweenStartTime) / tweenDuration, 0, 1);

				tween.value = tween.easingFunction(normalized);
				tween.updateAll();
			}
		}
	}

	async start() {
		for (const tween of this.tweens) {
			await tween.start();
		}
	}

}
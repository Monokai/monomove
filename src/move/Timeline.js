import clamp from '../math/clamp';

export default class Timeline {

	constructor(tweens) {
		this.tweens = tweens.slice().sort((a, b) => a.delayTime - b.delayTime);
		this.totalTime = tweens.reduce((total, tween) => Math.max(total, tween.delayTime + tween._duration), 0);
	}

	setPosition(position) {
		const time = clamp(position, 0, 1) * this.totalTime;

		// reset all tweens that start later than position
		for (let i = this.tweens.length - 1; i >= 0; i--) {
			const tween = this.tweens[i];

			if (tween.delayTime > time) {
				tween.value = 0;
				tween.updateAll();
			} else {
				break;
			}
		}

		for (const tween of this.tweens) {
			const tweenDuration = tween._duration;
			const tweenTime = tween.delayTime + tweenDuration;
			const tweenStartTime = tween.delayTime;

			if (tweenTime < time) {
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
		await Promise.all(this.tweens.map(tween => tween.start()));
	}

}
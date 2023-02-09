import Tween from './Tween.js';

export default class AbstractTimeline {

	previousPosition = null;
	delay = null;

	constructor({
		delay = 0
	} = {}) {
		this.previousPosition = 0;
		this.delay = delay;
	}

	static setTweenIn(tween, isIn) {
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

	static setTweenVisibility(tween, isVisible) {
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

	async start() {
		const tween = new Tween(({value}) => this.setPosition(value), this.totalTime / 1000);

		await tween.start();
	}

}

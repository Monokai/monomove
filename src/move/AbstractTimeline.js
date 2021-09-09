export default class AbstractTimeline {

	constructor({
		delay = 0
	} = {}) {
		this.previousPosition = 0;
		this.delay = delay;
	}

	setTweenIn(tween, isIn) {
		tween.timelineIn = isIn;

		if (tween.timelineIn !== tween.previousTimelineIn) {
			if (isIn && tween.onTimelineIn) {
				tween.onTimelineIn(tween.object);
			} else if (!isIn && tween.onTimelineOut) {
				tween.onTimelineOut(tween.object);
			}

			tween.previousTimelineIn = tween.timelineIn;
		}
	}

	setTweenVisibility(tween, isVisible) {
		tween.timelineVisible = isVisible;

		if (tween.timelineVisible !== tween.previousTimelineVisible) {
			if (isVisible && tween.onTimelineVisible) {
				tween.onTimelineVisible(tween.object);
			} else if (!isVisible && tween.onTimelineInvisible) {
				tween.onTimelineInvisible(tween.object);
			}

			tween.previousTimelineVisible = tween.timelineVisible;
		}
	}

}
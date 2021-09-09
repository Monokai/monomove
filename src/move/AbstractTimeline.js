export default class AbstractTimeline {

	constructor() {
		this.previousPosition = 0;
	}

// 	setTweenStart(tween, isStarted) {
// 		tween.timelineStart = isStarted;
// 
// 		if (tween.timelineStart !== tween.previousTimelineStart) {
// 			if (isStarted && tween.onTimelineStart) {
// 				tween.onTimelineStart(tween.object);
// 			} else if (!isStarted && tween.onTimelineComplete) {
// 				tween.onTimelineComplete(tween.object);
// 			}
// 
// 			tween.previousTimelineStart = tween.timelineStart;
// 		}
// 	}

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
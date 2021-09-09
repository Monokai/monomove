import BezierEasing from '../math/BezierEasing';
import RenderLoop from './RenderLoop';
import TweenManager from './TweenManager';

export default class {

	constructor(object = {}, duration = 1) {
		if (typeof object === 'function' && duration !== undefined) {
			// shortcut
			this.object = {
				value: 0
			};
			this.onUpdateCallback = object;
			this.valuesEnd = {
				value: 1
			};
			this._duration = duration * 1000;
		} else {
			// normal initialization
			this.object           = object;
			this._duration         = 1000;
			this.valuesEnd        = {};
			this.onUpdateCallback = null;
		}

		this.loopNum                     = 0;
		this.loopCount                   = 0;
		this.delayTime                   = 0;
		this.isPlaying                   = false;
		this.onLoopCallback              = null;
		this.onCompleteCallback          = null;
		this.onStartCallback             = null;
		this.onStartCallbackFired        = false;
		// this.onTimelineStartCallback     = null;
		// this.onTimelineCompleteCallback  = null;
		this.onTimelineVisibleCallback   = null;
		this.onTimelineInvisibleCallback = null;
		this.previousTime                = null;
		this.startTime                   = null;
		this.value                       = 0;
		this.elapsed                     = 0;
		this.valuesStart                 = {};
		this.previousUpdateValue         = null;
		this.easingFunction              = k => k;

		Object.keys(this.object).forEach(key => {
			this.valuesStart[key] = this.object[key];
		});
	}

	static async delay(time) {
		return new Promise(resolve => {
			new this()
				.duration(time)
				.onComplete(resolve)
				.start();
		});
	}

	// static getTime() {
	// 	return RenderLoop.getTime();
	// }

	from(properties) {
		Object.keys(properties).forEach(key => {
			this.object[key] = properties[key];
		});

		if (this.onUpdateCallback !== null) {
			this.onUpdateCallback(this.object, this.value, 0);
		}

		return this;
	}

	to(properties, duration) {
		if (duration !== undefined) {
			this._duration = duration * 1000;
		}

		this.valuesEnd = properties;

		return this;
	}

	duration(duration) {
		this._duration = duration * 1000;

		return this;
	}

	rewind() {
		Object.keys(this.object).forEach(key => {
			this.object[key] = this.valuesStart[key];
		});

		this.value = this.easingFunction(0);

		return this;
	}

	restart() {
		return this.rewind().start();
	}

	loop(num = Infinity) {
		this.loopNum = num;
		this.loopCount = num;

		return this;
	}

	onLoop(callback) {
		this.onLoopCallback = callback;

		return this;
	}

	startTween(time = RenderLoop.getTime()) {
		const wasPlaying = this.isPlaying;

		this.elapsed = 0;
		this.isPlaying = true;
		this.onStartCallbackFired = false;
		this.startTime = time;
		this.startTime += this.delayTime;

		Object.keys(this.valuesEnd).forEach(key => {
			this.valuesStart[key] = this.object[key];
		});

		if (this._duration === 0 && this.loopNum === 0 && this.delayTime === 0) {
			// trigger immediately and be done with it
			this.update(time);
			this.isPlaying = false;
		} else {
			if (!wasPlaying) {
				TweenManager.add(this);
			}

			RenderLoop.trigger();
		}

		return this;
	}

	start(...args) {
		const onComplete = this.onCompleteCallback;

		return new Promise(resolve => {
			this.onCompleteCallback = () => {
				if (onComplete) {
					onComplete();
				}

				resolve(this);
			};

			this.startTween(...args);
		});
	}

	stop() {
		if (!this.isPlaying) {
			return this;
		}

		this.isPlaying = false;

		TweenManager.remove(this);

		return this;
	}

	delay(amount) {
		this.delayTime = amount * 1000;

		return this;
	}

	easing(_easing = k => k) {
		let easing = _easing;

		if (!easing) {
			return this;
		}

		if (typeof easing === 'string') {
			easing = new BezierEasing(easing);
		}

		if (easing.get) {
			this.easingFunction = easing.get.bind(easing);
		} else {
			this.easingFunction = easing;
		}

		return this;
	}

	onStart(callback) {
		this.onStartCallback = callback;

		return this;
	}

	onUpdate(callback) {
		this.onUpdateCallback = callback;

		return this;
	}

	onComplete(callback = null) {
		this.onCompleteCallback = callback;

		return this;
	}

// 	onTimelineStart(callback) {
// 		this.onTimelineStartCallback = callback;
// 
// 		return this;
// 	}
// 
// 	onTimelineComplete(callback) {
// 		this.onTimelineCompleteCallback = callback;
// 
// 		return this;
// 	}

	onTimelineVisible(callback) {
		this.onTimelineVisibleCallback = callback;

		return this;
	}

	onTimelineInvisible(callback) {
		this.onTimelineInvisibleCallback = callback;

		return this;
	}

	updateAllValues(delta = 0) {
		if (this.value === this.previousUpdateValue) {
			return;
		}

		Object.entries(this.valuesEnd).forEach(this.updateValue, this);

		if (this.onUpdateCallback !== null) {
			this.onUpdateCallback(this.object, this.value, delta);
		}

		this.previousUpdateValue = this.value;
	}

	updateValue([key, value]) {
		const start = this.valuesStart[key];

		this.object[key] = start + (value - start) * this.value;
	}

	update(time) {
		if (time < this.startTime) {
			return true;
		}

		if (this.onStartCallbackFired === false) {
			if (this.onStartCallback !== null) {
				this.onStartCallback(this.object);
			}
			this.onStartCallbackFired = true;
		}

		this.elapsed = time - this.startTime;

		const normalizedElapsed = this._duration === 0 ? 1 : Math.min(this.elapsed / this._duration, 1);
		this.value = this.easingFunction(normalizedElapsed);

		if (this.previousTime === null) {
			this.previousTime = time;
		}

		const delta = time - this.previousTime;

		this.previousTime = time;

		this.updateAllValues(delta);

		if (normalizedElapsed === 1) {
			const tempStartTime = this.startTime;

			if (this.loopCount > 0) {
				if (this.onLoopCallback) {
					this.onLoopCallback(this.object, this.loopNum - this.loopCount);
				}

				this.loopCount--;
				this.restart();
			} else {
				if (this.onCompleteCallback && this.isPlaying) {
					this.onCompleteCallback(this.object, time - this.startTime);
				}
			}

			// check if started again in callback
			this.isPlaying = !(tempStartTime === this.startTime);

			return false;
		}

		return true;
	}

}
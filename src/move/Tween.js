import RenderLoop from './RenderLoop.js';
import TweenManager from './TweenManager.js';

export default class {

	durationMS = null;
	isPlaying = null;
	delayTime = null;
	startTime = null;
	easingFunction = null;
	object = null;
	value = null;

	#onUpdateCallback;
	#valuesEnd;
	#valuesEndEntries;
	#loopNum;
	#loopCount;
	#onLoopCallback;
	#onCompleteCallback;
	#onStartCallback;
	#onStartCallbackFired;
	#onTimelineInCallback;
	#onTimelineOutCallback;
	#onTimelineVisibleCallback;
	#onTimelineInvisibleCallback;
	#previousTime;
	#elapsed;
	#valuesStart;
	#previousUpdateValue;

	constructor(object = {}, duration = 1) {
		if (typeof object === 'function' && duration !== undefined) {
			// shortcut
			this.object = {
				value: 0
			};

			this.#onUpdateCallback = object;
			this.#valuesEnd = {
				value: 1
			};

			this.durationMS = duration * 1000;

			this.#valuesStart = {
				value: 0
			};

			this.#valuesEndEntries = ['value', this.#valuesEnd['value']];
		} else {
			// normal initialization
			this.object = object;
			this.#valuesEnd = {};
			this.#onUpdateCallback = null;
			this.durationMS = 1000;

			this.#valuesStart = {};
			this.#valuesEndEntries = [];
		}

		this.#loopNum                     = 0;
		this.#loopCount                   = 0;
		this.#onLoopCallback              = null;
		this.#onCompleteCallback          = null;
		this.#onStartCallback             = null;
		this.#onStartCallbackFired        = false;
		this.#onTimelineInCallback        = null;
		this.#onTimelineOutCallback       = null;
		this.#onTimelineVisibleCallback   = null;
		this.#onTimelineInvisibleCallback = null;
		this.#previousTime                = null;
		this.#elapsed                     = 0;
		this.#previousUpdateValue         = null;

		this.easingFunction              = k => k;
		this.value                       = 0;
		this.delayTime                   = 0;
		this.isPlaying                   = false;
		this.startTime                   = null;

		Object.keys(this.object).forEach(key => {
			this.#valuesStart[key] = this.object[key];
		});
	}

	from(properties) {
		Object.keys(properties).forEach(key => {
			this.object[key] = properties[key];
		});

		if (this.#onUpdateCallback !== null) {
			this.#onUpdateCallback(this.object, this.value, 0);
		}

		return this;
	}

	to(properties, duration) {
		if (duration !== undefined) {
			this.durationMS = duration * 1000;
		}

		this.#valuesEnd = properties;
		this.#valuesEndEntries.length = 0;

		return this;
	}

	duration(duration) {
		this.durationMS = duration * 1000;

		return this;
	}

	rewind() {
		Object.keys(this.object).forEach(key => {
			this.object[key] = this.#valuesStart[key];
		});

		this.value = this.easingFunction(0);

		return this;
	}

	restart() {
		return this.rewind().start();
	}

	loop(num = Infinity) {
		this.#loopNum = num;
		this.#loopCount = num;

		return this;
	}

	#onLoop(callback) {
		this.#onLoopCallback = callback;

		return this;
	}

	startTween(time = RenderLoop.getTime()) {
		const wasPlaying = this.isPlaying;

		this.#elapsed = 0;
		this.#onStartCallbackFired = false;

		this.isPlaying = true;
		this.startTime = time + this.delayTime;

		if (this.#valuesEndEntries.length === 0) {
			Object.keys(this.#valuesEnd).forEach(key => {
				this.#valuesStart[key] = this.object[key];
				this.#valuesEndEntries.push(key, this.#valuesEnd[key]);
			});
		}

		if (this.durationMS === 0 && this.#loopNum === 0 && this.delayTime === 0) {
			// trigger immediately and be done with it
			this.update(time);
			this.isPlaying = false;
		} else if (!wasPlaying) {
			TweenManager.add(this);
			RenderLoop.play();
		}

		return this;
	}

	start(...args) {
		const onComplete = this.#onCompleteCallback;

		return new Promise(resolve => {
			this.#onCompleteCallback = () => {
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

	easing(_easing = k => k, {
		iterations = TweenManager.bezierIterations,
		cacheSize = TweenManager.bezierCacheSize
	} = {}) {
		let easing = _easing;

		if (!easing) {
			return this;
		}

		if (typeof easing === 'string') {
			easing = TweenManager.getEasingFromCache(easing);

			if (iterations) {
				easing.setIterations(iterations);
			}

			if (cacheSize) {
				easing.setCacheSize(cacheSize);
			}
		}

		if (easing.get) {
			this.easingFunction = easing.get.bind(easing);
		} else {
			this.easingFunction = easing;
		}

		return this;
	}

	onStart(callback) {
		this.#onStartCallback = callback;

		return this;
	}

	onUpdate(callback) {
		this.#onUpdateCallback = callback;

		return this;
	}

	onComplete(callback = null) {
		this.#onCompleteCallback = callback;

		return this;
	}

	onTimelineIn(callback) {
		this.#onTimelineInCallback = callback;

		return this;
	}

	onTimelineOut(callback) {
		this.#onTimelineOutCallback = callback;

		return this;
	}

	onTimelineVisible(callback) {
		this.#onTimelineVisibleCallback = callback;

		return this;
	}

	onTimelineInvisible(callback) {
		this.#onTimelineInvisibleCallback = callback;

		return this;
	}

	updateAllValues(delta = 0) {
		if (this.value === this.#previousUpdateValue) {
			return;
		}

		for (let i = 0; i < this.#valuesEndEntries.length; i += 2) {
			this.#updateValue(this.#valuesEndEntries[i], this.#valuesEndEntries[i + 1]);
		}

		if (this.#onUpdateCallback !== null) {
			this.#onUpdateCallback(this.object, this.value, delta);
		}

		this.#previousUpdateValue = this.value;
	}

	invalidate() {
		this.#previousUpdateValue = null;

		return this;
	}

	#updateValue(key, value) {
		const start = this.#valuesStart[key];

		this.object[key] = start + (value - start) * this.value;
	}

	update(time) {
		if (time < this.startTime) {
			return true;
		}

		if (this.#onStartCallbackFired === false) {
			if (this.#onStartCallback !== null) {
				this.#onStartCallback(this.object);
			}

			this.#onStartCallbackFired = true;
			RenderLoop.trigger();
		}

		this.#elapsed = time - this.startTime;

		const normalizedElapsed = this.durationMS === 0 ? 1 : Math.min(this.#elapsed / this.durationMS, 1);

		this.value = this.easingFunction(normalizedElapsed);

		if (this.#previousTime === null) {
			this.#previousTime = time;
		}

		const delta = time - this.#previousTime;

		this.#previousTime = time;

		this.updateAllValues(delta);

		if (normalizedElapsed === 1) {
			const tempStartTime = this.startTime;

			if (this.#loopCount > 0) {
				if (this.#onLoopCallback) {
					this.#onLoopCallback(this.object, this.#loopNum - this.#loopCount);
				}

				this.#loopCount--;
				this.restart();
			} else if (this.#onCompleteCallback && this.isPlaying) {
				this.#onCompleteCallback(this.object, time - this.startTime);
			}

			// check if started again in callback
			this.isPlaying = !(tempStartTime === this.startTime);

			return false;
		}

		return true;
	}

}

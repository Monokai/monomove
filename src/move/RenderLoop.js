import 'move/RAF';
import TweenManager from 'move/TweenManager';

export default new class {

	constructor() {
		this.callbacks = [];
		this.cleanUps = [];
		this.dirtyCallbacks = 0;
		this.isAnimating = true;
		this.ms = 0;
		this.pauseTime = 0;
		this.pauseTimeStart = 0;
		this.performance = null;
		this.performance = {};
		this.previousTime = 0;
		this.requestAnimation = true;
		this.requestID = 0;
		this.time = 0;

		if (window.performance) {
			this.performance = window.performance;
		}

		if (!this.performance.now) {
			const offset = this.performance.timing && this.performance.timing.navigationStart ? this.performance.timing.navigationStart : Date.now();

			this.performance.now = function() {
				return Date.now() - offset;
			};
		}

		this.animate();
	}

	tick(callback) {
		if (callback.isPlaying) {
			const isDirty = callback.funk.call(callback.context, this.ms);

			if (isDirty) {
				this.dirtyCallbacks++;
			}
		}
	}

	cleanUpFunk(callback) {
		if (callback.isPlaying) {
			callback.cleanUp.call(callback.context);
		}
	}

	animate() {
		const animationLoop = () => {
			this.time = this.performance.now() - this.pauseTime;
			this.ms = this.previousTime ? this.time - this.previousTime : 0;

			const hasTweens = TweenManager.onTick(this.time);

			this.dirtyCallbacks = 0;

			if (this.isAnimating) {
				this.callbacks.forEach(this.tick, this);
			}

			if (this.isAnimating && (this.dirtyCallbacks > 0 || hasTweens)) {
				this.requestID = window.requestAnimationFrame(animationLoop);
			} else {
				console.log('stop rendering', this.isAnimating, this.dirtyCallbacks, hasTweens);
				this.requestAnimation = false;
			}

			this.cleanUps.forEach(this.cleanUpFunk, this);

			this.previousTime = this.time;
		};

		animationLoop();
	}

	stop(callback) {
		this.isAnimating = false;
		window.cancelAnimationFrame(this.requestID);

		if (callback) {
			callback();
		}

		this.trigger();
	}

	add(context, funk, cleanUp) {
		const o = {
			context,
			funk,
			cleanUp,
			isPlaying: true
		};

		this.callbacks.push(o);

		if (o.cleanUp) {
			this.cleanUps.push(o);
		}

		this.trigger();
	}

	remove(context, funk) {
		const filter = f => !(f.context === context && (funk ? f.funk === funk : true));

		this.callbacks = this.callbacks.filter(filter);
		this.cleanUps = this.cleanUps.filter(filter);

		this.trigger();
	}

	trigger() {
		if (this.requestAnimation) {
			return;
		}

		this.requestAnimation = true;
		this.requestID = window.requestAnimationFrame(this.animate.bind(this));
	}

	getTime() {
		this.time = this.performance.now() - this.pauseTime;

		return this.time;
	}

}();
import { TweenManager } from './TweenManager.js';

type RenderCallback = (ms: number) => boolean | void;

const W = window;
const isBrowser = typeof W !== 'undefined';
const subscribers: (RenderCallback | null)[] = [];

let isUpdating = false;
let activeCount = 0;
let ms = 0;
let time = 0;
let previousTime = 0;
let pauseTime = 0;
let pauseTimeStart = 0;
let isAnimating = false;
let requestAnimation = false;
let requestID = 0;
let isFirstTime = true;

const compact = () => {
	let writePtr = 0;
	const len = subscribers.length;

	for (let i = 0; i < len; i++) {
		const sub = subscribers[i];

		if (sub !== null) {
			if (i !== writePtr) {
				subscribers[writePtr] = sub;
			}
			writePtr++;
		}
	}

	subscribers.length = writePtr;
	activeCount = writePtr;
};

const animate = () => {
	if (!isBrowser) {
		return;
	}

	const now = W.performance.now();

	time = now - pauseTime;

	if (isFirstTime) {
		ms = 0;
		isFirstTime = false;
	} else {
		ms = time - previousTime;
	}

	if (ms < 0) {
		ms = 0;
	}

	// We access TweenManager directly as an object now
	const hasTweens = TweenManager.onTick(time);
	const len = subscribers.length;

	let dirtyCount = 0;

	isUpdating = true;

	for (let i = 0; i < len; i++) {
		const sub = subscribers[i];

		if (sub !== null) {
			if (sub(ms) !== false) {
				dirtyCount++;
			}
		}
	}

	isUpdating = false;

	if (activeCount < subscribers.length) {
		compact();
	}

	previousTime = time;

	// Keep loop running if active or if we have tweens
	if (isAnimating && (dirtyCount > 0 || hasTweens)) {
		requestID = W.requestAnimationFrame(animate);
		requestAnimation = true;
	} else {
		requestAnimation = false;
	}
};

export const RenderLoop = {
	stop: (callback?: () => void) => {
		isAnimating = false;

		if (isBrowser) {
			W.cancelAnimationFrame(requestID);
		}

		requestAnimation = false;

		if (callback) {
			callback();
		}
	},

	add: (callback: RenderCallback) => {
		subscribers.push(callback);
		activeCount++;

		RenderLoop.trigger();
	},

	reset: () => {
		subscribers.length = 0;
		activeCount = 0;

		TweenManager.removeAll();
		RenderLoop.stop();

		ms = 0;
		time = 0;
		previousTime = 0;
		pauseTime = 0;
		pauseTimeStart = 0;
		isAnimating = false;
		requestAnimation = false;
		requestID = 0;
		isFirstTime = true;
	},

	remove: (callback: RenderCallback) => {
		const index = subscribers.indexOf(callback);

		if (index !== -1) {
			if (isUpdating) {
				subscribers[index] = null;
				activeCount--;
			} else {
				subscribers.splice(index, 1);
				activeCount--;
			}
		}

		RenderLoop.trigger();
	},

	trigger: () => {
		if (!isBrowser || requestAnimation) {
			return;
		}

		// When waking up from idle, sync time to prevent huge deltas
		if (!isFirstTime) {
			previousTime = RenderLoop.getTime();
		}

		requestAnimation = true;
		requestID = W.requestAnimationFrame(animate);
	},

	getTime: () => {
		return isBrowser ? W.performance.now() - pauseTime : 0;
	},

	pause: () => {
		if (!isAnimating || !isBrowser) {
			return;
		}

		pauseTimeStart = W.performance.now();
		requestAnimation = false;
		isAnimating = false;

		W.cancelAnimationFrame(requestID);
	},

	play: () => {
		if (isAnimating || !isBrowser) {
			return;
		}

		if (!isFirstTime) {
			pauseTime += W.performance.now() - pauseTimeStart;
		}

		RenderLoop.triggerAnimation();
	},

	triggerAnimation: () => {
		isAnimating = true;
		RenderLoop.trigger();
	},

	isPlaying: () => {
		return isAnimating;
	}
};

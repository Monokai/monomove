import type { BezierLike } from '../types.js';

const PRESETS: Record<string, number[]> = {
	// CSS Standards
	'linear': [0, 0, 1, 1],
	'ease': [0.25, 0.1, 0.25, 1],
	'easeIn': [0.42, 0, 1, 1],
	'easeOut': [0, 0, 0.58, 1],
	'easeInOut': [0.42, 0, 0.58, 1],

	// Sine
	'easeInSine': [0.47, 0, 0.745, 0.715],
	'easeOutSine': [0.39, 0.575, 0.565, 1],
	'easeInOutSine': [0.445, 0.05, 0.55, 0.95],

	// Quad
	'easeInQuad': [0.55, 0.085, 0.68, 0.53],
	'easeOutQuad': [0.25, 0.46, 0.45, 0.94],
	'easeInOutQuad': [0.455, 0.03, 0.515, 0.955],

	// Cubic
	'easeInCubic': [0.55, 0.055, 0.675, 0.19],
	'easeOutCubic': [0.215, 0.61, 0.355, 1],
	'easeInOutCubic': [0.645, 0.045, 0.355, 1],

	// Quart
	'easeInQuart': [0.895, 0.03, 0.685, 0.22],
	'easeOutQuart': [0.165, 0.84, 0.44, 1],
	'easeInOutQuart': [0.77, 0, 0.175, 1],

	// Quint
	'easeInQuint': [0.755, 0.05, 0.855, 0.06],
	'easeOutQuint': [0.23, 1, 0.32, 1],
	'easeInOutQuint': [0.86, 0, 0.07, 1],

	// Expo
	'easeInExpo': [0.95, 0.05, 0.795, 0.035],
	'easeOutExpo': [0.19, 1, 0.22, 1],
	'easeInOutExpo': [1, 0, 0, 1],

	// Circ
	'easeInCirc': [0.6, 0.04, 0.98, 0.335],
	'easeOutCirc': [0.075, 0.82, 0.165, 1],
	'easeInOutCirc': [0.785, 0.135, 0.15, 0.86],

	// Back
	'easeInBack': [0.6, -0.28, 0.735, 0.045],
	'easeOutBack': [0.175, 0.885, 0.32, 1.275],
	'easeInOutBack': [0.68, -0.55, 0.265, 1.55]
};

export class CubicBezier implements BezierLike {

	#iterations: number;
	#cacheSize: number;
	#cachedValueStepSize = 0;
	#cachedValues: number[] = [0];
	#x1: number;
	#y1: number;
	#x2: number;
	#y2: number;
	#isPreComputed: boolean;

	static #calculate(t: number, a: number, b: number): number {
		return (((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t + (3 * a)) * t;
	}

	static #getSlope(t: number, a: number, b: number): number {
		return 3 * (1 - 3 * b + 3 * a) * t ** 2 + 2 * (3 * b - 6 * a) * t + (3 * a);
	}

	constructor(x1: number | string, y1 = 0, x2 = 0, y2 = 0) {
		this.#iterations = 16;
		this.#cacheSize = 11;
		this.setCacheSize(this.#cacheSize);

		if (typeof x1 === 'string') {
			const preset = PRESETS[x1];
			if (preset) {
				this.#x1 = preset[0];
				this.#y1 = preset[1];
				this.#x2 = preset[2];
				this.#y2 = preset[3];
			} else {
				const p = x1.split(',');
				this.#x1 = Number(p[0]);
				this.#y1 = Number(p[1]);
				this.#x2 = Number(p[2]);
				this.#y2 = Number(p[3]);
			}
		} else {
			this.#x1 = x1;
			this.#y1 = y1;
			this.#x2 = x2;
			this.#y2 = y2;
		}

		this.#isPreComputed = false;
	}

	#newtonRaphson(a: number, _t: number, x1: number, x2: number): number {
		let t = _t;
		for (let i = 0; i < this.#iterations; ++i) {
			const slope = CubicBezier.#getSlope(t, x1, x2);
			if (slope === 0) return t;
			const x = CubicBezier.#calculate(t, x1, x2) - a;
			t -= x / slope;
		}
		return t;
	}

	#preCompute() {
		this.#cachedValues = new Array(this.#cacheSize);
		for (let i = 0; i < this.#cacheSize; ++i) {
			this.#cachedValues[i] = CubicBezier.#calculate(i * this.#cachedValueStepSize, this.#x1, this.#x2);
		}
		this.#isPreComputed = true;
	}

	#getT(x: number) {
		const lastSample = this.#cacheSize - 1;
		let start = 0;
		let i = 1;
		for (; i !== lastSample && this.#cachedValues[i] <= x; ++i) {
			start += this.#cachedValueStepSize;
		}
		--i;
		const dist = (x - this.#cachedValues[i]) / (this.#cachedValues[i + 1] - this.#cachedValues[i]);
		const guessForT = start + dist * this.#cachedValueStepSize;
		return this.#newtonRaphson(x, guessForT, this.#x1, this.#x2);
	}

	get(x: number) {
		if (!this.#isPreComputed) this.#preCompute();
		if (x === 0) return 0;
		if (x === 1) return 1;
		return CubicBezier.#calculate(this.#getT(x), this.#y1, this.#y2);
	}

	setIterations(x: number) {
		this.#iterations = x;
	}

	setCacheSize(x: number) {
		this.#cacheSize = x;
		this.#cachedValueStepSize = 1 / (this.#cacheSize - 1);
		this.#cachedValues = new Array(this.#cacheSize);
		this.#isPreComputed = false;
	}
}
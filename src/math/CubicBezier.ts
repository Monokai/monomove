export default class CubicBezier {

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
			const p = x1.split(',');

			this.#x1 = Number(p[0]);
			this.#y1 = Number(p[1]);
			this.#x2 = Number(p[2]);
			this.#y2 = Number(p[3]);
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

			if (slope === 0) {
				return t;
			}

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
		if (!this.#isPreComputed) {
			this.#preCompute();
		}

		if (x === 0) {
			return 0;
		}

		if (x === 1) {
			return 1;
		}

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
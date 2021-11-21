const MAX_NEWTON_ITERATIONS = 16;
const NUM_CACHED_VALUES = 11;

export default class BezierEasing {

	#cachedValueStepSize;
	#cachedValues;
	#x1;
	#y1;
	#x2;
	#y2;
	#isPreComputed;

	constructor(_x1, _y1 = 0, _x2 = 0, _y2 = 0) {
		let x1 = _x1;
		let y1 = _y1;
		let x2 = _x2;
		let y2 = _y2;

		this.#cachedValueStepSize = 1 / (NUM_CACHED_VALUES - 1);
		this.#cachedValues = new Array(NUM_CACHED_VALUES);

		if (typeof x1 === 'string') {
			const p = x1.split(',');

			x1 = Number(p[0]);
			y1 = Number(p[1]);
			x2 = Number(p[2]);
			y2 = Number(p[3]);
		}

		this.#x1 = x1;
		this.#y1 = y1;
		this.#x2 = x2;
		this.#y2 = y2;
		this.#isPreComputed = false;
	}

	static a(a, b) {
		return 1 - 3 * b + 3 * a;
	}

	static b(a, b) {
		return 3 * b - 6 * a;
	}

	static c(a) {
		return 3 * a;
	}

	static calculateBezier(t, a, b) {
		return ((BezierEasing.a(a, b) * t + BezierEasing.b(a, b)) * t + BezierEasing.c(a)) * t;
	}

	static getSlope(t, a, b) {
		return 3 * BezierEasing.a(a, b) * t * t + 2 * BezierEasing.b(a, b) * t + BezierEasing.c(a);
	}

	static newtonRaphson(a, _t, x1, x2) {
		let t = _t;

		for (let i = 0; i < MAX_NEWTON_ITERATIONS; ++i) {
			const slope = BezierEasing.getSlope(t, x1, x2);

			if (slope === 0) {
				return t;
			}

			const x = BezierEasing.calculateBezier(t, x1, x2) - a;

			t -= x / slope;
		}

		return t;
	}

	#preCompute() {
		for (let i = 0; i < NUM_CACHED_VALUES; ++i) {
			this.#cachedValues[i] = BezierEasing.calculateBezier(i * this.#cachedValueStepSize, this.#x1, this.#x2);
		}

		this.#isPreComputed = true;
	}

	#getT(x) {
		const lastSample = NUM_CACHED_VALUES - 1;

		let start = 0;
		let i = 1;

		for (; i !== lastSample && this.#cachedValues[i] <= x; ++i) {
			start += this.#cachedValueStepSize;
		}

		--i;

		const dist = (x - this.#cachedValues[i]) / (this.#cachedValues[i + 1] - this.#cachedValues[i]);
		const guessForT = start + dist * this.#cachedValueStepSize;

		return BezierEasing.newtonRaphson(x, guessForT, this.#x1, this.#x2);
	}

	get(x) {
		if (!this.#isPreComputed) {
			this.#preCompute();
		}

		if (x === 0) {
			return 0;
		}

		if (x === 1) {
			return 1;
		}

		return BezierEasing.calculateBezier(this.#getT(x), this.#y1, this.#y2);
	}

}

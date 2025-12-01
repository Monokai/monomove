import { BezierPresets } from './BezierPresets.js';
import type { BezierLike } from '../types.js';

export class CubicBezier implements BezierLike {
	private _iterations = 4;
	private _cacheSize = 11;
	private _newtonRaphsonMinSlope = 0.001;
	private _subdivisionPrecision = 0.0000001;
	private _subdivisionIterations = 10;
	private _cachedValueStepSize = 0;
	private _cachedValues: number[] = [0];
	private _x1: number;
	private _y1: number;
	private _x2: number;
	private _y2: number;
	private _isPreComputed: boolean;
	private _precision = 1e-5;

	private static _calculate(t: number, a: number, b: number): number {
		return (((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t + 3 * a) * t;
	}

	private static _getSlope(t: number, a: number, b: number): number {
		return 3 * (1 - 3 * b + 3 * a) * t ** 2 + 2 * (3 * b - 6 * a) * t + 3 * a;
	}

	constructor(x1: number | string, y1 = 0, x2 = 0, y2 = 0) {
		this.setCacheSize(this._cacheSize);

		if (typeof x1 === 'string') {
			const preset = BezierPresets[x1];
			if (preset) {
				this._x1 = preset[0];
				this._y1 = preset[1];
				this._x2 = preset[2];
				this._y2 = preset[3];
			} else {
				const p = x1.split(',');
				this._x1 = Number(p[0]);
				this._y1 = Number(p[1]);
				this._x2 = Number(p[2]);
				this._y2 = Number(p[3]);
			}
		} else {
			this._x1 = x1;
			this._y1 = y1;
			this._x2 = x2;
			this._y2 = y2;
		}

		this._isPreComputed = false;
	}

	private _binarySubdivide(aX: number, aA: number, aB: number, mX1: number, mX2: number): number {
		let currentX: number;
		let currentT: number;
		let i = 0;

		do {
			currentT = aA + (aB - aA) / 2.0;
			currentX = CubicBezier._calculate(currentT, mX1, mX2) - aX;
			if (currentX > 0.0) {
				aB = currentT;
			} else {
				aA = currentT;
			}
		} while (
			Math.abs(currentX) > this._subdivisionPrecision &&
			++i < this._subdivisionIterations
		);

		return currentT;
	}

	private _newtonRaphson(a: number, _t: number, x1: number, x2: number): number {
		let t = _t;

		for (let i = 0; i < this._iterations; ++i) {
			const slope = CubicBezier._getSlope(t, x1, x2);
			if (slope === 0) {
				return t;
			}

			const x = CubicBezier._calculate(t, x1, x2) - a;

			if (Math.abs(x) < this._precision) {
				return t;
			}

			t -= x / slope;
		}
		return t;
	}

	private _preCompute() {
		this._cachedValues = new Array(this._cacheSize);

		for (let i = 0; i < this._cacheSize; ++i) {
			this._cachedValues[i] = CubicBezier._calculate(
				i * this._cachedValueStepSize,
				this._x1,
				this._x2
			);
		}

		this._isPreComputed = true;
	}

	private _getT(x: number): number {
		let intervalStart = 0.0;
		let currentSample = 1;
		const lastSample = this._cacheSize - 1;

		for (
			;
			currentSample !== lastSample && this._cachedValues[currentSample] <= x;
			++currentSample
		) {
			intervalStart += this._cachedValueStepSize;
		}

		--currentSample;

		const dist =
			(x - this._cachedValues[currentSample]) /
			(this._cachedValues[currentSample + 1] - this._cachedValues[currentSample]);
		const guessForT = intervalStart + dist * this._cachedValueStepSize;

		const initialSlope = CubicBezier._getSlope(guessForT, this._x1, this._x2);

		// if slope is effectively 0, Newton-Raphson will fail. Use Binary Subdivision.
		if (initialSlope >= this._newtonRaphsonMinSlope) {
			return this._newtonRaphson(x, guessForT, this._x1, this._x2);
		} else if (initialSlope === 0.0) {
			return guessForT;
		} else {
			return this._binarySubdivide(
				x,
				intervalStart,
				intervalStart + this._cachedValueStepSize,
				this._x1,
				this._x2
			);
		}
	}

	public get(x: number) {
		if (!this._isPreComputed) {
			this._preCompute();
		}

		if (x === 0) {
			return 0;
		}

		if (x === 1) {
			return 1;
		}

		return CubicBezier._calculate(this._getT(x), this._y1, this._y2);
	}

	public setIterations(x: number) {
		this._iterations = x;
	}

	public setCacheSize(x: number) {
		this._cacheSize = x;
		this._cachedValueStepSize = 1 / (this._cacheSize - 1);
		this._cachedValues = new Array(this._cacheSize);
		this._isPreComputed = false;
	}
}

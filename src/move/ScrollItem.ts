import { smoothValue } from '../math/smoothValue.js';
import type {
	DOMRectLike,
	ScrollItemOptions,
	SmoothScrollCallback,
	SmoothScrollCallbackData
} from '../types.js';

const isBrowser = typeof window !== 'undefined';
const W = isBrowser ? window : ({} as Window);

export class ScrollItem {
	public readonly element: HTMLElement;
	public readonly smoothing: number;
	public readonly observer: IntersectionObserver | null;

	public data: SmoothScrollCallbackData;

	private _box: DOMRectLike;

	private _hasEnteredOnce = false;
	private _hasExitedOnce = false;
	private _previousIsInView = false;
	private _previousFactor = NaN;

	private _directionOffset: number;
	private _offset: number;
	private _speed: number;

	private _onUpdate: SmoothScrollCallback | undefined;
	private _onScrolledIn: ((data: SmoothScrollCallbackData) => void) | undefined;
	private _onScrolledOut: ((data: SmoothScrollCallbackData) => void) | undefined;
	private _onScrolledInOnce: ((data: SmoothScrollCallbackData) => void) | undefined;
	private _onScrolledOutOnce: ((data: SmoothScrollCallbackData) => void) | undefined;

	private _smoothScrollFunk: ((x: number, delta: number, smooth: number) => number) | undefined;

	constructor(
		element: HTMLElement,
		index: number,
		options: ScrollItemOptions,
		callback?: SmoothScrollCallback,
		observer: IntersectionObserver | null = null
	) {
		this.element = element;
		this.observer = observer;

		this._directionOffset = options.directionOffset || 0;
		this._offset = options.offset || 0;
		this._speed = options.speed || 1;
		this.smoothing = options.smoothing || 0;

		if (callback) {
			this._onUpdate = callback;
		} else if (options.onUpdate) {
			this._onUpdate = options.onUpdate;
		}

		this._onScrolledIn = options.onScrolledIn;
		this._onScrolledOut = options.onScrolledOut;
		this._onScrolledInOnce = options.onScrolledInOnce;
		this._onScrolledOutOnce = options.onScrolledOutOnce;

		this._box = { left: 0, top: 0, width: 0, height: 0 };

		this.data = {
			item: element,
			factor: 0,
			rawFactor: 0,
			rawBoxFactor: 0,
			boxFactor: 0,
			box: this._box,
			scroll: 0,
			smoothScrollValue: 0,
			isInView: false,
			boxIsInView: false,
			index: index,
			originalTop: 0,
			isVisible: true,
			data: options.data
		};
	}

	public setVisible(visible: boolean) {
		this.data.isVisible = visible;
	}

	public get isVisible(): boolean {
		return this.data.isVisible;
	}

	public resize(scrollTop: number) {
		if (!this.element) {
			return;
		}

		const rect = this.element.getBoundingClientRect();
		const scrollLeft = isBrowser ? W.scrollX || W.pageXOffset : 0;

		this._box.left = rect.left + scrollLeft;
		this._box.top = rect.top + scrollTop;
		this._box.width = rect.width;
		this._box.height = rect.height;

		this.data.originalTop = this._box.top;
	}

	public update(
		currentScroll: number,
		viewportHeight: number,
		isScrollingDown: boolean,
		forceUpdate: boolean = false,
		ms: number = 16.6
	): void {
		const box = this._box;
		if (box.height === 0) return;

		this.data.scroll = currentScroll;

		if (this.smoothing && this._smoothScrollFunk) {
			// const deltaSeconds = (ms * 60) / 1000;

			this.data.smoothScrollValue = this._smoothScrollFunk(
				currentScroll,
				ms,
				this.smoothing
			);
		} else {
			this.data.smoothScrollValue = currentScroll;
		}

		const directionOffset = this._directionOffset * (isScrollingDown ? -1 : 1);

		const pos =
			box.top +
			box.height -
			this.data.smoothScrollValue +
			directionOffset * viewportHeight +
			this._offset * viewportHeight;

		const range = viewportHeight + box.height;
		const rawFactor = pos / range;
		const rawBoxFactor = (pos - viewportHeight) / box.height;
		const speed = this._speed;

		this.data.rawFactor = (1 - rawFactor - 0.5) * speed + 0.5;
		this.data.rawBoxFactor = (1 - rawBoxFactor - 0.5) * speed + 0.5;

		this.data.factor =
			this.data.rawFactor < 0 ? 0 : this.data.rawFactor > 1 ? 1 : this.data.rawFactor;

		this.data.boxFactor =
			this.data.rawBoxFactor < 0
				? 0
				: this.data.rawBoxFactor > 1
					? 1
					: this.data.rawBoxFactor;

		this.data.isInView = this.data.rawFactor >= 0 && this.data.rawFactor <= 1;
		this.data.boxIsInView = this.data.rawBoxFactor >= 0 && this.data.rawBoxFactor <= 1;

		if (this.data.isInView !== this._previousIsInView) {
			if (this.data.isInView) {
				if (this.smoothing) {
					this._smoothScrollFunk = smoothValue(currentScroll);
				}

				this._onScrolledIn?.(this.data);

				if (!this._hasEnteredOnce) {
					this._hasEnteredOnce = true;
					this._onScrolledInOnce?.(this.data);
				}
			} else {
				this._onScrolledOut?.(this.data);
				this._smoothScrollFunk = undefined;

				if (!this._hasExitedOnce) {
					this._hasExitedOnce = true;
					this._onScrolledOutOnce?.(this.data);
				}
			}

			this._previousIsInView = this.data.isInView;
		}

		if (this._onUpdate && (this._previousFactor !== this.data.factor || forceUpdate)) {
			this._onUpdate(this.data);
			this._previousFactor = this.data.factor;
		}
	}
}

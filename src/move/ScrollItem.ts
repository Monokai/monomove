import { smoothValue } from '../math/smoothValue.js';
import type {
	DOMRectLike,
	ScrollItemOptions,
	SmoothScrollCallback,
	SmoothScrollCallbackData
} from '../types.js';

export class ScrollItem {
	public readonly element: HTMLElement;
	public readonly smoothing: number;
	public readonly observer: IntersectionObserver | null;

	private _box: DOMRectLike;
	private _data: SmoothScrollCallbackData;

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

	private _smoothScrollFn: ((x: number, delta: number, smooth: number) => number) | undefined;

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

		this._data = {
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
			centerOffset: 0,
			originalTop: 0,
			isVisible: true,
			data: options.data
		};
	}

	public setVisible(visible: boolean) {
		this._data.isVisible = visible;
	}

	public get isVisible(): boolean {
		return this._data.isVisible;
	}

	public getData(): SmoothScrollCallbackData {
		return this._data;
	}

	public resize(scrollTop: number, viewportHeight: number) {
		const rect = this.element.getBoundingClientRect();
		const scrollLeft = window.scrollX || window.pageXOffset;

		this._box.left = rect.left + scrollLeft;
		this._box.top = rect.top + scrollTop;
		this._box.width = rect.width;
		this._box.height = rect.height;

		this._data.centerOffset = (viewportHeight - this._box.height) * 0.5;
		this._data.originalTop = this._box.top;
		this._data.scroll = this._data.smoothScrollValue;
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

		this._data.scroll = currentScroll;

		if (this.smoothing && this._smoothScrollFn) {
			const deltaSeconds = (ms * 60) / 1000;

			this._data.smoothScrollValue = this._smoothScrollFn(
				currentScroll,
				deltaSeconds,
				this.smoothing
			);
		} else {
			this._data.smoothScrollValue = currentScroll;
		}

		const directionOffset = this._directionOffset * (isScrollingDown ? -1 : 1);

		const pos =
			box.top +
			box.height -
			this._data.smoothScrollValue +
			directionOffset * viewportHeight +
			this._offset * viewportHeight;

		const range = viewportHeight + box.height;
		const rawFactor = pos / range;
		const rawBoxFactor = (pos - viewportHeight) / box.height;
		const speed = this._speed;

		this._data.rawFactor = (1 - rawFactor - 0.5) * speed + 0.5;
		this._data.rawBoxFactor = (1 - rawBoxFactor - 0.5) * speed + 0.5;

		this._data.factor =
			this._data.rawFactor < 0 ? 0 : this._data.rawFactor > 1 ? 1 : this._data.rawFactor;

		this._data.boxFactor =
			this._data.rawBoxFactor < 0
				? 0
				: this._data.rawBoxFactor > 1
					? 1
					: this._data.rawBoxFactor;

		this._data.isInView = this._data.rawFactor >= 0 && this._data.rawFactor <= 1;
		this._data.boxIsInView = this._data.rawBoxFactor >= 0 && this._data.rawBoxFactor <= 1;

		if (this._data.isInView !== this._previousIsInView) {
			if (this._data.isInView) {
				if (this.smoothing) {
					this._smoothScrollFn = smoothValue(currentScroll);
				}

				this._onScrolledIn?.(this._data);

				if (!this._hasEnteredOnce) {
					this._hasEnteredOnce = true;
					this._onScrolledInOnce?.(this._data);
				}
			} else {
				this._onScrolledOut?.(this._data);
				this._smoothScrollFn = undefined;

				if (!this._hasExitedOnce) {
					this._hasExitedOnce = true;
					this._onScrolledOutOnce?.(this._data);
				}
			}

			this._previousIsInView = this._data.isInView;
		}

		if (this._onUpdate && (this._previousFactor !== this._data.factor || forceUpdate)) {
			this._onUpdate(this._data);
			this._previousFactor = this._data.factor;
		}
	}
}

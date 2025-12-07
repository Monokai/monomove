import { clamp } from '../math/clamp.js';
import { RenderLoop } from './RenderLoop.js';
import { Tween } from './Tween.js';
import { ScrollItem } from './ScrollItem.js';
import type {
	SmoothScrollOptions,
	SmoothScrollCallback,
	DOMRectLike,
	ScrollItemOptions,
	EasingFunction
} from '../types.js';

interface WindowWithObserver extends Window {
	IntersectionObserver?: typeof IntersectionObserver;
}

const isBrowser = typeof window !== 'undefined';
const W = isBrowser ? (window as WindowWithObserver) : ({} as WindowWithObserver);

let passiveSupported = false;

if (isBrowser) {
	try {
		const options = Object.defineProperty({}, 'passive', {
			get: () => {
				passiveSupported = true;
				return true;
			}
		}) as unknown as AddEventListenerOptions;
		W.addEventListener('test', () => {}, options);
		W.removeEventListener('test', () => {}, options);
	} catch {
		// ignore
	}
}

const PASSIVE_OPTS = passiveSupported ? { passive: true } : false;

export class SmoothScroller {
	public isDown = false;
	public isLocked = false;
	public scroll = 0;
	public scrollWidth = 0;
	public scrollHeight = 0;

	private _pixelRatio = 1;
	private _scrollThreshold = 0.01;
	private _targetScroll = 0;
	private _previousScroll = 0;
	private _viewportHeight = 0;
	private _items: ScrollItem[] = [];
	private _activeItems = new Set<ScrollItem>();
	private _smoothItems = new Set<ScrollItem>();
	private _debugCanvas: HTMLCanvasElement | null = null;
	private _debugContext: CanvasRenderingContext2D | null = null;
	private _isAnimating = false;
	private _previousScrollWidth = 0;
	private _previousScrollHeight = 0;
	private _isFirstScrollInstant = true;
	private _isTouch = false;

	private _scrollTween = new Tween<{ y: number }>({ y: 0 })
		.easing('0.35,0.15,0,1')
		.onUpdate((o: { y: number }) => {
			if (isBrowser) {
				W.scrollTo(0, o.y);
			}

			this._isAnimating = true;
			this.scroll = o.y;
			this._targetScroll = o.y;
			this.isDown = this._targetScroll >= this._previousScroll;
			this._previousScroll = this._targetScroll;
		});

	private _touchScrollDuration = 0;
	private _scrollDuration = 0;
	private _container: HTMLElement;
	private _content: HTMLElement;
	private _listener: Window | HTMLElement;
	private _debug = false;
	private _onResizeFunk: (() => void) | null = null;
	private _totalTickTime = 0;
	private _scrollFrom = 0;
	private _easing: EasingFunction;

	private _getScrollPosition: () => number;

	private _onTickFunk = this._onTick.bind(this);

	private _onTouchStart = () => {
		if (!this.isLocked) {
			this._isTouch = true;
		}
	};

	private _onMouseDown = (e: Event) => {
		e.stopPropagation();

		if (!this.isLocked) {
			this._isTouch = false;
		}
	};

	private _onWheel = () => {
		if (this.isLocked) {
			return;
		}

		this._scrollTween.stop();
		this._isTouch = false;
	};

	private _onScroll = () => {
		if (this.isLocked) {
			return;
		}

		this._isAnimating = true;

		const maxScroll = Math.max(0, this.scrollHeight - this._viewportHeight);
		const current = this._getScrollPosition();

		this._targetScroll = current < 0 ? 0 : current > maxScroll ? maxScroll : current;
		this._scrollFrom = this.scroll;
		this._totalTickTime = 0;
	};

	constructor({
		container = isBrowser ? document.body : (null as unknown as HTMLElement),
		content = isBrowser ? document.body : (null as unknown as HTMLElement),
		easing = (x) => Math.min(1, 1.001 - 2 ** (-10 * x)),
		scrollDuration = 0,
		listener = isBrowser ? window : (null as unknown as Window),
		debug = false,
		onResize
	}: SmoothScrollOptions = {}) {
		this._scrollDuration = scrollDuration || 0;
		this._container = container;
		this._content = content;
		this._listener = listener;
		this._debug = debug;
		this._easing = easing;
		this._onResizeFunk = onResize || null;

		if (!this._listener) {
			this._getScrollPosition = () => 0;
		} else if ('scrollY' in this._listener) {
			this._getScrollPosition = () => (this._listener as Window).scrollY;
		} else if ('pageYOffset' in this._listener) {
			this._getScrollPosition = () => (this._listener as Window).pageYOffset;
		} else {
			const el = this._listener as HTMLElement;

			this._getScrollPosition = () => el.scrollTop;
		}

		this._setupListeners();
		this._setupDebug();

		RenderLoop.add(this._onTickFunk);
		RenderLoop.play();

		this.resize();
	}

	private _setupListeners() {
		if (!this._listener) {
			return;
		}

		const opts = PASSIVE_OPTS as EventListenerOptions;
		const l = this._listener;

		l.addEventListener('touchstart', this._onTouchStart, opts);
		l.addEventListener('scroll', this._onScroll, opts);
		l.addEventListener('mousedown', this._onMouseDown, opts);
		l.addEventListener('wheel', this._onWheel, opts);
	}

	private _setupDebug() {
		if (this._debug && this._container && isBrowser) {
			this._debugCanvas = document.createElement('canvas');
			this._container.appendChild(this._debugCanvas);
		}
	}

	private _onTick(ms: number) {
		if (this.isLocked) {
			return true;
		}

		if (!this._content) {
			return true;
		}

		const sw = this._content.scrollWidth;
		const sh = this._content.scrollHeight;

		if (sw !== this.scrollWidth || sh !== this.scrollHeight) {
			this.scrollWidth = sw;
			this.scrollHeight = sh;

			if (sw !== this._previousScrollWidth || sh !== this._previousScrollHeight) {
				this.resize();
			}

			this._previousScrollWidth = sw;
			this._previousScrollHeight = sh;

			this.scroll = this._scrollFrom = this._targetScroll;
			this._updateAll(this.scroll, ms);

			return true;
		}

		if (this._smoothItems.size > 0) {
			for (const item of this._smoothItems) {
				if (this._activeItems.has(item) && this._isAnimating) continue;

				const data = item.getData();
				if (Math.abs(data.smoothScrollValue - this.scroll) > this._scrollThreshold) {
					item.update(this.scroll, this._viewportHeight, this.isDown, false, ms);
				}
			}
		}

		// Fail-safe: If not animating, but actual scroll differed from internal state (e.g. event missed), wake up.
		if (!this._isAnimating) {
			const actual = this._getScrollPosition();

			if (Math.abs(actual - this.scroll) > 1) {
				this._isAnimating = true;
				this._targetScroll = actual;
				this._scrollFrom = this.scroll;
				this._totalTickTime = 0;
			}
		}

		if (!this._isAnimating) {
			return true;
		}

		const diff = this._targetScroll - this.scroll;
		const isComplete = Math.abs(diff) < this._scrollThreshold;

		if (isComplete) {
			// Fix: Force update on completion to ensure final state (Scroll=0) is processed
			this.scroll = this._targetScroll;
			this._updateAll(this.scroll, ms);

			if (this._isTouch) {
				this.triggerAnimations(true);
			}

			this._isAnimating = false;

			return true;
		}

		this._totalTickTime += ms / 1000;

		const duration = this._isTouch ? this._touchScrollDuration : this._scrollDuration;
		const linearProgress = duration === 0 ? 1 : clamp(this._totalTickTime / duration, 0, 1);
		const easedProgress = this._easing(linearProgress);

		this.scroll = this._scrollFrom + (this._targetScroll - this._scrollFrom) * easedProgress;

		if (this._isFirstScrollInstant) {
			this._isFirstScrollInstant = false;
			this.scroll = this._scrollFrom = this._targetScroll;
			const tempIsDown = this.isDown;
			this.isDown = true;
			this.triggerAnimations(true);
			this.isDown = false;
			this.triggerAnimations(true);
			this.isDown = tempIsDown;
		}

		this._updateAll(this.scroll, ms);

		return true;
	}

	private _updateAll(scroll: number, ms: number = 16.6) {
		this.isDown = scroll >= this._previousScroll;
		this._previousScroll = scroll;

		if (this._activeItems.size > 0) {
			for (const item of this._activeItems) {
				item.update(this.scroll, this._viewportHeight, this.isDown, false, ms);
			}
		}

		if (this._debugContext) {
			this._drawDebug();
		}
	}

	public draw() {
		this._updateAll(this.scroll);
	}

	public drawAll() {
		for (const item of this._items) {
			item.update(this.scroll, this._viewportHeight, this.isDown, true);
		}
	}

	public getScrollPosition() {
		return this._getScrollPosition();
	}

	public resize() {
		if (!this._container || !this._content || !isBrowser) {
			return;
		}

		this.scroll = this._scrollFrom = this._previousScroll = this._targetScroll;
		this.scrollHeight = this._content.scrollHeight;
		this._viewportHeight = W.innerHeight;
		this._pixelRatio = W.devicePixelRatio;

		const scrollTop = W.scrollY || W.pageYOffset;

		for (let i = 0; i < this._items.length; i++) {
			this._items[i].resize(scrollTop);
		}

		if (this._debugCanvas) {
			const w = W.innerWidth;
			const h = W.innerHeight;
			const dpr = this._pixelRatio;

			this._debugCanvas.width = w * dpr;
			this._debugCanvas.height = h * dpr;

			Object.assign(this._debugCanvas.style, {
				position: 'fixed',
				left: '0',
				top: '0',
				width: `${w}px`,
				height: `${h}px`,
				pointerEvents: 'none',
				zIndex: '9999999'
			});

			this._debugContext = this._debugCanvas.getContext('2d');
		}

		if (this._onResizeFunk) {
			this._onResizeFunk();
		}

		this._refreshActiveSets();
	}

	public triggerAnimations(all = false) {
		if (all) {
			const len = this._items.length;

			for (let i = 0; i < len; i++) {
				this._items[i].update(this.scroll, this._viewportHeight, this.isDown, true);
			}
		} else {
			for (const item of this._activeItems) {
				item.update(this.scroll, this._viewportHeight, this.isDown, true);
			}
		}

		if (this._debugContext) {
			this._drawDebug();
		}
	}

	private _drawDebug() {
		if (!this._debugContext || !this._debugCanvas) {
			return;
		}

		const ctx = this._debugContext;

		ctx.clearRect(0, 0, this._debugCanvas.width, this._debugCanvas.height);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 2 * this._pixelRatio;
		ctx.beginPath();

		const pr = this._pixelRatio;
		const h = this._viewportHeight;

		for (const item of this._activeItems) {
			const data = item.getData();
			const y = data.box.top - data.scroll;

			if (y + data.box.height >= 0 && y <= h) {
				ctx.rect(data.box.left * pr, y * pr, data.box.width * pr, data.box.height * pr);
			}
		}
		ctx.stroke();
	}

	public add(items: HTMLElement | HTMLElement[], options: ScrollItemOptions): void;
	public add(
		items: HTMLElement | HTMLElement[],
		callback: SmoothScrollCallback,
		options?: ScrollItemOptions
	): void;
	public add(
		_items: HTMLElement | HTMLElement[],
		arg2: SmoothScrollCallback | ScrollItemOptions,
		arg3: ScrollItemOptions = {}
	) {
		const items = Array.isArray(_items) ? _items : [_items];

		let callback: SmoothScrollCallback | undefined;
		let options: ScrollItemOptions;

		if (typeof arg2 === 'function') {
			callback = arg2;
			options = arg3;
		} else {
			options = arg2 || {};
			callback = undefined;
		}

		const ObserverClass = W.IntersectionObserver;
		const useObserver = isBrowser && !!ObserverClass;
		const root = options.observeIn === undefined ? null : options.observeIn;
		const dirOff = options.directionOffset || 0;
		const off = options.offset || 0;
		const spd = options.speed || 1;
		const marginY1 = dirOff ? dirOff * 100 : spd ? (1 / spd) * 100 : 0;
		const marginY2 = dirOff ? dirOff * 100 : off ? off * 100 : spd ? (1 / spd) * 100 : 0;
		const rootMargin = `${marginY1}% 0% ${marginY2}% 0%`;

		let observer: IntersectionObserver | null = null;

		if (useObserver && ObserverClass) {
			observer = new ObserverClass(
				(entries) => {
					for (const entry of entries) {
						const target = entry.target as HTMLElement;
						const item = this._items.find((i) => i.element === target);

						if (item) {
							const isVisible = entry.isIntersecting;
							item.setVisible(isVisible);

							if (isVisible && !item.smoothing) {
								this._activeItems.add(item);
							} else if (!isVisible && !item.smoothing) {
								this._activeItems.delete(item);
							}

							item.update(this.scroll, this._viewportHeight, this.isDown);
						}
					}
				},
				{
					root,
					rootMargin,
					threshold: 0
				}
			);
		}

		const scrollTop = isBrowser ? W.scrollY || W.pageYOffset : 0;

		for (let i = 0; i < items.length; i++) {
			const element = items[i];
			const item = new ScrollItem(element, i, options, callback, observer);

			item.resize(scrollTop);

			if (observer) {
				observer.observe(element);
				item.setVisible(false);
			} else {
				this._activeItems.add(item);

				item.update(this.scroll, this._viewportHeight, this.isDown, true);
			}

			if (item.smoothing) {
				this._smoothItems.add(item);
			}

			this._items.push(item);
		}
	}

	private _refreshActiveSets() {
		this._activeItems.clear();
		this._smoothItems.clear();

		for (const item of this._items) {
			if (item.smoothing) {
				this._smoothItems.add(item);
			}

			if (item.isVisible && !item.smoothing) {
				this._activeItems.add(item);
			}
		}
	}

	public remove(_items: HTMLElement | HTMLElement[]) {
		const items = Array.isArray(_items) ? _items : [_items];
		const set = new Set(items);

		const kept: ScrollItem[] = [];

		for (const item of this._items) {
			if (set.has(item.element)) {
				item.observer?.unobserve(item.element);

				this._activeItems.delete(item);
				this._smoothItems.delete(item);
			} else {
				kept.push(item);
			}
		}

		this._items = kept;
	}

	public getBox(node: HTMLElement): DOMRectLike {
		const rect = node.getBoundingClientRect();
		const scrollTop = isBrowser ? W.scrollY || W.pageYOffset : 0;
		const scrollLeft = isBrowser ? W.scrollX || W.pageXOffset : 0;

		return {
			left: rect.left + scrollLeft,
			top: rect.top + scrollTop,
			width: rect.width,
			height: rect.height
		};
	}

	public scrollTo(position = 0, time: number | null = null) {
		const dist = Math.abs(position - this.scroll);
		const t = time ?? clamp(dist * 0.00025, 0.25, 2.5);

		return this._scrollTween.from({ y: this.scroll }).to({ y: position }, t).start();
	}

	public scrollToElement(node: HTMLElement, offset = 0, time: number | null = null) {
		const box = this.getBox(node);

		return this.scrollTo(box.top + offset, time);
	}

	public reset() {
		for (const item of this._items) {
			item.observer?.unobserve(item.element);
		}

		this._items.length = 0;
		this._activeItems.clear();
		this._smoothItems.clear();
		this._viewportHeight = 0;
	}

	public stop() {
		this._isAnimating = false;
		this._scrollTween.stop();
	}

	public lock() {
		this.isLocked = true;
	}

	public unlock() {
		this.isLocked = false;
		if (isBrowser) W.scrollTo(0, this.scroll);
	}

	public setContent(content: HTMLElement) {
		this._content = content;
		this.resize();
	}

	public unsetContent() {
		this._content = null as unknown as HTMLElement;
	}

	public setScrollDuration(value: number) {
		this._scrollDuration = value;
	}

	public setTouchScrollDuration(value: number) {
		this._touchScrollDuration = value;
	}

	public destroy() {
		this._debugCanvas?.remove();

		if (this._listener) {
			const l = this._listener;
			const opts = PASSIVE_OPTS as EventListenerOptions;

			l.removeEventListener('touchstart', this._onTouchStart, opts);
			l.removeEventListener('wheel', this._onWheel, opts);
			l.removeEventListener('mousedown', this._onMouseDown, opts);
			l.removeEventListener('scroll', this._onScroll, opts);
		}

		this.reset();
		this.stop();

		RenderLoop.remove(this._onTickFunk);
	}
}

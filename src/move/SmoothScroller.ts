import { clamp } from '../math/clamp.js';
import { smoothValue } from '../math/smoothValue.js';
import { RenderLoop } from './RenderLoop.js';
import { Tween } from './Tween.js';
import type { 
	SmoothScrollOptions, 
	ScrollAnimationEntry, 
	SmoothScrollCallback, 
	DOMRectLike, 
	ScrollItemOptions,
	EasingFunction
} from '../types.js';

let passiveSupported = false;
try {
	const options = Object.defineProperty({}, 'passive', {
		get: () => {
			passiveSupported = true;
			return true;
		}
	}) as unknown as AddEventListenerOptions;
	window.addEventListener('test', () => {}, options);
	window.removeEventListener('test', () => {}, options);
} catch (e) { /* ignore */ }

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
	
	private _animations: ScrollAnimationEntry[] = [];
	
	private _activeAnimations = new Set<ScrollAnimationEntry>();
	private _smoothAnimations = new Set<ScrollAnimationEntry>();

	private _debugCanvas: HTMLCanvasElement | null = null;
	private _debugContext: CanvasRenderingContext2D | null = null;
	private _isAnimating = false;
	private _previousScrollWidth = 0;
	private _previousScrollHeight = 0;
	
	private _isFirstScrollInstant = true;
	private _isTouch = false;
	
	private _scrollTween = new Tween<{y: number}>({ y: 0 })
		.easing('0.35,0.15,0,1')
		// Explicitly type 'o' to match the generic T provided to Tween
		.onUpdate((o: {y: number}) => {
			window.scrollTo(0, o.y);
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
	
	private _getScrollFn: () => number;

	private _tickHandler = this._onTick.bind(this);
	private _touchStartHandler = () => { if (!this.isLocked) this._isTouch = true; };
	private _mouseDownHandler = (e: Event) => { e.stopPropagation(); if (!this.isLocked) this._isTouch = false; };
	private _wheelHandler = () => { 
		if (this.isLocked) return;
		this._scrollTween.stop(); 
		this._isTouch = false; 
	};
	private _scrollHandler = () => {
		if (this.isLocked) return;
		this._isAnimating = true;
		const maxScroll = Math.max(0, this.scrollHeight - this._viewportHeight);
		const current = this._getScrollFn();
		this._targetScroll = current < 0 ? 0 : (current > maxScroll ? maxScroll : current);
		this._scrollFrom = this.scroll;
		this._totalTickTime = 0;
	};

	constructor({
		container = window.document.body,
		content = window.document.body,
		easing = x => Math.min(1, 1.001 - 2 ** (-10 * x)),
		scrollFactor = null,
		scrollDuration = 0,
		listener = window,
		debug = false,
		onResize
	}: SmoothScrollOptions = {}) {
		this._scrollDuration = scrollDuration || 0;
		this._container = container;
		this._content = content;
		this._listener = listener;
		this._debug = debug || false;
		this._easing = easing;
		this._onResizeFunk = onResize || null;

		if (scrollFactor) {
			console.warn('Monomove: scrollFactor is deprecated, please use scrollDuration');
		}

		if ('scrollY' in this._listener) {
			this._getScrollFn = () => (this._listener as Window).scrollY;
		} else if ('pageYOffset' in this._listener) {
			this._getScrollFn = () => (this._listener as Window).pageYOffset;
		} else {
			const el = this._listener as HTMLElement;
			this._getScrollFn = () => el.scrollTop;
		}

		this._setupListeners();
		this._setupDebug();

		RenderLoop.add(this._tickHandler);
		RenderLoop.play();

		this.resize();
	}

	private _setupListeners() {
		if (!this._listener) return;
		
		const opts = PASSIVE_OPTS as EventListenerOptions;
		const l = this._listener;
		
		l.addEventListener('touchstart', this._touchStartHandler, opts);
		l.addEventListener('scroll', this._scrollHandler, opts);
		l.addEventListener('mousedown', this._mouseDownHandler, opts);
		l.addEventListener('wheel', this._wheelHandler, opts);
	}

	private _setupDebug() {
		if (this._debug && this._container) {
			this._debugCanvas = document.createElement('canvas');
			this._container.appendChild(this._debugCanvas);
		}
	}

	private _onTick(ms: number) {
		if (this.isLocked) return true;

		const sw = this._content.scrollWidth;
		const sh = this._content.scrollHeight;

		if (sw !== this.scrollWidth || sh !== this.scrollHeight) {
			this.scrollWidth = sw;
			this.scrollHeight = sh;
			this._previousScrollWidth = sw;
			this._previousScrollHeight = sh;
			
			this.resize();
			this.scroll = this._scrollFrom = this._targetScroll;
			this._updateAll(this.scroll);
			return true;
		}

		if (this._smoothAnimations.size > 0) {
			for (const a of this._smoothAnimations) {
				if (Math.abs(a.animationObject.smoothScrollValue - this.scroll) > this._scrollThreshold) {
					this._triggerAnimation(a, undefined, ms);
				}
			}
		}

		if (!this._isAnimating) return true;

		const diff = this._targetScroll - this.scroll;
		const isComplete = Math.abs(diff) < this._scrollThreshold;

		if (isComplete) {
			if (Math.abs(diff) > 0) {
				 this.scroll = this._targetScroll;
				 this._updateAll(this.scroll);
			}
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

		this._updateAll(this.scroll);
		return true;
	}

	private _updateAll(scroll: number) {
		this.isDown = scroll >= this._previousScroll;
		this._previousScroll = scroll;
		
		if (this._activeAnimations.size > 0) {
			for (const a of this._activeAnimations) {
				this._triggerAnimation(a);
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
		for (const a of this._animations) {
			this._triggerAnimation(a);
		}
	}

	public getScrollPosition() {
		return this._getScrollFn();
	}

	public resize() {
		if (!this._container || !this._content) return;

		this.scroll = this._scrollFrom = this._previousScroll = this._targetScroll;
		this.scrollHeight = this._content.scrollHeight;
		this._viewportHeight = window.innerHeight;
		this._pixelRatio = window.devicePixelRatio;

		const scrollTop = window.scrollY || window.pageYOffset;
		for (let i = 0; i < this._animations.length; i++) {
			this._initBox(this._animations[i], scrollTop);
		}

		if (this._debugCanvas) {
			const w = window.innerWidth;
			const h = window.innerHeight;
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
			const len = this._animations.length;
			for (let i = 0; i < len; i++) {
				this._triggerAnimation(this._animations[i]);
			}
		} else {
			for (const a of this._activeAnimations) {
				this._triggerAnimation(a);
			}
		}
		
		if (this._debugContext) this._drawDebug();
	}

	private _drawDebug() {
		if (!this._debugContext || !this._debugCanvas) return;
		
		const ctx = this._debugContext;
		ctx.clearRect(0, 0, this._debugCanvas.width, this._debugCanvas.height);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 2 * this._pixelRatio;
		ctx.beginPath();
		
		const pr = this._pixelRatio;
		const h = this._viewportHeight;
		
		for (const a of this._activeAnimations) {
			const o = a.animationObject;
			const y = o.box.top - o.scroll;
			
			if (y + o.box.height >= 0 && y <= h) {
				ctx.rect(
					o.box.left * pr,
					y * pr,
					o.box.width * pr,
					o.box.height * pr
				);
			}
		}
		ctx.stroke();
	}

	private _triggerAnimation(a: ScrollAnimationEntry, forceInView?: boolean, ms?: number) {
		const box = a.box;
		if (box.height === 0) return;

		const o = a.animationObject;
		o.scroll = this.scroll;

		if (a.smoothing && a.smoothScroll) {
			const deltaSeconds = (ms || 16.6) * 60 / 1000;
			o.smoothScrollValue = a.smoothScroll(o.scroll, deltaSeconds, a.smoothing);
		} else {
			o.smoothScrollValue = o.scroll;
		}

		const h = this._viewportHeight;
		const directionOffset = a.directionOffset * (this.isDown ? -1 : 1);
		
		const pos = box.top + box.height - o.smoothScrollValue 
				  + (directionOffset * h) 
				  + (a.offset * h);

		const range = h + box.height;
		const rawFactor = pos / range;
		const rawBoxFactor = (pos - h) / box.height;

		const speed = a.speed;
		o.rawFactor = ((1 - rawFactor) - 0.5) * speed + 0.5;
		o.rawBoxFactor = ((1 - rawBoxFactor) - 0.5) * speed + 0.5;

		o.factor = o.rawFactor < 0 ? 0 : (o.rawFactor > 1 ? 1 : o.rawFactor);
		o.boxFactor = o.rawBoxFactor < 0 ? 0 : (o.rawBoxFactor > 1 ? 1 : o.rawBoxFactor);

		o.isInView = forceInView ?? (o.rawFactor >= 0 && o.rawFactor <= 1);
		o.boxIsInView = o.rawBoxFactor >= 0 && o.rawBoxFactor <= 1;

		o.box = box;
		if (o.fixedTop) o.box.top = o.fixedTop;

		if (o.isInView !== o.previousIsInView) {
			if (o.isInView) {
				if (a.smoothing) {
					a.smoothScroll = smoothValue(o.scroll);
				}
				o.isScrolledIn = true;
				if (o.isScrolledInOnce === undefined) o.isScrolledInOnce = true;
			} else if (o.previousIsInView !== undefined) {
				o.isScrolledOut = true;
				a.smoothScroll = undefined;
				if (o.isScrolledOutOnce === undefined) o.isScrolledOutOnce = true;
			}
		}

		if (a.animation && (a.previousFactor !== o.factor || forceInView !== undefined)) {
			a.animation(o);
			a.previousFactor = o.factor;
		}

		o.isScrolledIn = false;
		o.isScrolledOut = false;
		if (o.isScrolledInOnce) o.isScrolledInOnce = false;
		if (o.isScrolledOutOnce) o.isScrolledOutOnce = false;

		o.previousIsInView = o.isInView;
	}

	public add(_items: HTMLElement | HTMLElement[], callback: SmoothScrollCallback, options: ScrollItemOptions = {}) {
		const items = Array.isArray(_items) ? _items : [_items];
		
		const useObserver = !!window.IntersectionObserver;
		const root = options.observeIn === undefined ? null : options.observeIn;
		
		const dirOff = options.directionOffset || 0;
		const off = options.offset || 0;
		const spd = options.speed || 1;
		
		const marginY1 = dirOff ? dirOff * 100 : (spd ? 1/spd * 100 : 0);
		const marginY2 = dirOff ? dirOff * 100 : (off ? off * 100 : (spd ? 1/spd * 100 : 0));
		const rootMargin = `${marginY1}% 0% ${marginY2}% 0%`;

		let observer: IntersectionObserver | null = null;
		
		if (useObserver) {
			observer = new window.IntersectionObserver((entries) => {
				for (const entry of entries) {
					const target = entry.target as HTMLElement;
					const anim = this._animations.find(a => a.item === target);
					if (anim) {
						const isVisible = entry.isIntersecting;
						anim.animationObject.isVisible = isVisible;
						
						if (isVisible && !anim.smoothing) {
							this._activeAnimations.add(anim);
						} else if (!isVisible && !anim.smoothing) {
							this._activeAnimations.delete(anim);
						}
						
						this._triggerAnimation(anim, isVisible);
					}
				}
			}, {
				root,
				rootMargin,
				threshold: 0
			});
		}

		const scrollTop = window.scrollY || window.pageYOffset;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const entry: ScrollAnimationEntry = {
				animation: callback,
				directionOffset: dirOff,
				offset: off,
				speed: spd,
				smoothing: options.smoothing,
				animationObject: {
					item,
					factor: 0,
					rawFactor: 0,
					rawBoxFactor: 0,
					boxFactor: 0,
					box: { left:0, top:0, width:0, height:0 },
					scroll: 0,
					smoothScrollValue: 0,
					isInView: false,
					boxIsInView: false,
					index: i,
					centerOffset: 0,
					originalTop: 0,
					isVisible: true,
					data: options.data
				},
				item,
				index: i,
				observer,
				box: { left:0, top:0, width:0, height:0 }
			};

			this._initBox(entry, scrollTop);
			
			if (observer) {
				observer.observe(item);
				entry.animationObject.isVisible = false; 
			} else {
				this._activeAnimations.add(entry);
			}

			if (entry.smoothing) {
				this._smoothAnimations.add(entry);
			}

			this._animations.push(entry);
		}
	}

	private _refreshActiveSets() {
		this._activeAnimations.clear();
		this._smoothAnimations.clear();

		for (const a of this._animations) {
			if (a.smoothing) {
				this._smoothAnimations.add(a);
			}
			if (a.animationObject.isVisible && !a.smoothing) {
				this._activeAnimations.add(a);
			}
		}
	}

	public remove(_items: HTMLElement | HTMLElement[]) {
		const items = Array.isArray(_items) ? _items : [_items];
		const set = new Set(items);

		const kept: ScrollAnimationEntry[] = [];
		
		for (const a of this._animations) {
			if (set.has(a.item)) {
				this._triggerAnimation(a, false);
				a.observer?.unobserve(a.item);
				this._activeAnimations.delete(a);
				this._smoothAnimations.delete(a);
			} else {
				kept.push(a);
			}
		}
		
		this._animations = kept;
	}

	public static getBox(node: HTMLElement): DOMRectLike {
		const rect = node.getBoundingClientRect();
		const scrollTop = window.scrollY || window.pageYOffset;
		const scrollLeft = window.scrollX || window.pageXOffset;
		
		return {
			left: rect.left + scrollLeft,
			top: rect.top + scrollTop,
			width: rect.width,
			height: rect.height
		};
	}

	private _initBox(a: ScrollAnimationEntry, scrollTop: number) {
		const rect = a.item.getBoundingClientRect();
		const scrollLeft = window.scrollX || window.pageXOffset;

		a.box = {
			left: rect.left + scrollLeft,
			top: rect.top + scrollTop,
			width: rect.width,
			height: rect.height
		};
		
		a.animationObject.centerOffset = (this._viewportHeight - a.box.height) * 0.5;
		a.animationObject.originalTop = a.box.top;
		a.animationObject.scroll = a.animationObject.smoothScrollValue = this._targetScroll;
	}

	public scrollTo(position = 0, time: number | null = null) {
		const dist = Math.abs(position - this.scroll);
		const t = time ?? clamp(dist * 0.00025, 0.25, 2.5);

		return this._scrollTween
			.from({ y: this.scroll })
			.to({ y: position }, t)
			.start();
	}

	public scrollToElement(node: HTMLElement, offset = 0, time: number | null = null) {
		const box = SmoothScroller.getBox(node);
		return this.scrollTo(box.top + offset, time);
	}

	public reset() {
		for (const a of this._animations) {
			a.observer?.unobserve(a.item);
		}
		this._animations.length = 0;
		this._activeAnimations.clear();
		this._smoothAnimations.clear();
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
		window.scrollTo(0, this.scroll);
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
			l.removeEventListener('touchstart', this._touchStartHandler, opts);
			l.removeEventListener('wheel', this._wheelHandler, opts);
			l.removeEventListener('mousedown', this._mouseDownHandler, opts);
			l.removeEventListener('scroll', this._scrollHandler, opts);
		}

		this.reset();
		this.stop();
		
		RenderLoop.remove(this._tickHandler);
	}
}
import clamp from '../math/clamp.js';
import smoothValue from '../math/smoothValue.js';
import RenderLoop from './RenderLoop.js';
import Tween from './Tween.js';

let supportsPassiveListeners = false;

try {
	const options = Object.defineProperty({}, 'passive', {
		get: () => {
			supportsPassiveListeners = true;

			return true;
		}
	});

	window.addEventListener('a', null, options);
	window.removeEventListener('a', null, options);
} catch (e) {
	// console.log('passive listeners not supported');
}

export default class SmoothScroller {

	isDown = false;
	isLocked = false;
	scroll = 0;
	scrollHeight = 0;

	#pixelRatio = 1;
	#scrollThreshold = 0.01;
	#targetScroll = 0;
	#previousScroll = 0;
	#height = 0;
	#animations = [];
	#activeAnimations = null;
	#smoothAnimations = null;
	#debugCanvas = null;
	#debugContext = null;
	#isAnimating = false;
	#previousTime = 0;
	#previousScrollWidth = 0;
	#previousScrollHeight = 0;
	#touchStartListener = null;
	#scrollListener = null;
	#wheelListener = null;
	#mouseDownListener = null;
	#isFirstScrollInstant = true;
	#isTouch = false;
	#isScrollingToAnchor = false;
	#scrollTween = new Tween()
		.easing('0.35,0.15,0,1')
		.onUpdate(o => {
			window.scrollTo(0, o.y);

			this.#isAnimating = true;
			this.scroll = o.y;
			this.#targetScroll = o.y;
			this.isDown = this.#targetScroll >= this.#previousScroll;
			this.#previousScroll = this.#targetScroll;
		})
		.onStart(() => {
			this.#isScrollingToAnchor = true;
		})
		.onComplete(() => {
			this.#isScrollingToAnchor = false;
		});

	#passive = supportsPassiveListeners ? {passive: true} : false;
	#touchScrollDuration = null;
	#scrollDuration = null;
	#container = null;
	#content = null;
	#listener = null;
	#debug = null;
	#onResizeFunk = null;
	#totalTickTime = 0;
	#scrollFrom = 0;
	#easing = 0;

	constructor({
		container = window.document.body,
		content = window.document.body,
		easing = x => Math.min(1, 1.001 - 2 ** (-10 * x)),
		scrollFactor = null,
		scrollDuration = 0,
		listener = window,
		debug = false,
		onResize
	} = {}) {
		this.#scrollDuration = scrollDuration;
		this.#container = container;
		this.#content = content;
		this.#listener = listener;
		this.#debug = debug;
		this.#easing = easing;
		this.#onResizeFunk = onResize;

		if (scrollFactor) {
			throw new Error('scrollFactor is deprecated, please use scrollDuration');
		}

		this.#touchStartListener = () => {
			if (this.isLocked) {
				return;
			}

			this.#isTouch = true;
		};

		this.#scrollListener = () => {
			if (this.isLocked) {
				return;
			}

			this.#isAnimating = true;
			this.#targetScroll = clamp(this.getScrollPosition(), 0, Math.round(this.scrollHeight - this.#height));
			this.#scrollFrom = this.scroll;
			this.#totalTickTime = 0;
		};

		this.#mouseDownListener = e => {
			e.stopPropagation();

			if (this.isLocked) {
				return;
			}

			this.#isTouch = false;
		};

		this.#wheelListener = () => {
			if (this.isLocked) {
				return;
			}

			if (this.#scrollTween) {
				this.#scrollTween.stop();
			}

			this.#isTouch = false;
			this.#isScrollingToAnchor = false;
		};

		if (this.#listener) {
			if (this.#debug) {
				console.log('add scroll listeners');
			}

			this.#listener.addEventListener('touchstart', this.#touchStartListener, this.#passive);
			this.#listener.addEventListener('scroll', this.#scrollListener, this.#passive);
			this.#listener.addEventListener('mousedown', this.#mouseDownListener, this.#passive);
			this.#listener.addEventListener('wheel', this.#wheelListener, this.#passive);
		}

		if (this.#debug) {
			this.#debugCanvas = window.document.createElement('canvas');
			this.#container.appendChild(this.#debugCanvas);
		}

		RenderLoop.add(this, this.#onTick);
		RenderLoop.play();

		this.resize();
	}

	#onTick(ms) {
		if (this.isLocked) {
			return true;
		}

		this.scrollWidth = this.#content?.scrollWidth ?? 0;
		this.scrollHeight = this.#content?.scrollHeight ?? 0;

		if (!(this.scrollWidth === this.#previousScrollWidth && this.scrollHeight === this.#previousScrollHeight)) {
			this.resize();
			this.scroll = this.#scrollFrom = this.#targetScroll;
			this.#onScroll(this.scroll);
			this.#previousScrollWidth = this.scrollWidth;
			this.#previousScrollHeight = this.scrollHeight;

			return true;
		}

		if (this.#smoothAnimations?.length) {
			this.#smoothAnimations.forEach(a => {
				this.#triggerAnimation(a, true, ms);
			});

			this.#updateActiveAnimations();
		}

		if (!this.#isAnimating) {
			return true;
		}

		const isComplete = Math.abs(this.#targetScroll - this.scroll) < this.#scrollThreshold;

		if (isComplete) {
			if (this.#debug) {
				// console.log('stop scrolling', this.scroll);
			}

			// trigger final animations on slow touch devices that can't keep up with intersection observers
			if (this.#isTouch) {
				if (this.#debug) {
					console.log('trigger all animations');
				}

				this.triggerAnimations(true);
			}

			this.#isAnimating = false;
		}

		this.#totalTickTime += ms / 1000;

		const linearProgress = clamp(this.#totalTickTime / (this.#isTouch ? this.#touchScrollDuration : this.#scrollDuration), 0, 1);
		const easedProgress = this.#easing(linearProgress);

		this.scroll = this.#scrollFrom + (this.#targetScroll - this.#scrollFrom) * easedProgress;

		if (this.#isFirstScrollInstant) {
			this.#isFirstScrollInstant = false;
			this.scroll = this.#scrollFrom = this.#targetScroll;

			if (this.#debug) {
				console.log('trigger all animations in both directions');
			}

			const tempIsDown = this.isDown;

			this.isDown = true;
			this.triggerAnimations(true);
			this.isDown = false;
			this.triggerAnimations(true);
			this.isDown = tempIsDown;
		}

		if (this.#activeAnimations === null) {
			this.#activeAnimations = this.#animations;
		}

		this.#onScroll(this.scroll);

		return true;
	}

	draw() {
		this.#onScroll();
	}

	drawAll() {
		const animations = this.#activeAnimations;

		this.#activeAnimations = this.#animations;
		this.#onScroll();
		this.#activeAnimations = animations;
	}

	getScrollPosition() {
		if (this.#listener.scrollY !== undefined) {
			return this.#listener.scrollY;
		}

		if (this.#listener.pageYOffset !== undefined) {
			return this.#listener.pageYOffset;
		}

		if (this.#listener.scrollTop !== undefined) {
			return this.#listener.scrollTop;
		}

		return 0;
	}

	resize() {
		if (!this.#container || !this.#content) {
			return;
		}

		this.scroll = this.#scrollFrom = this.#previousScroll = this.#targetScroll;
		this.scrollHeight = this.#content.scrollHeight;
		this.#height = window.innerHeight;
		this.#pixelRatio = window.devicePixelRatio;

		this.#animations.forEach(a => {
			this.#initBox(a);
		});

		if (this.#debugCanvas) {
			this.#debugCanvas.width = window.innerWidth * window.devicePixelRatio;
			this.#debugCanvas.height = window.innerHeight * window.devicePixelRatio;

			this.#debugCanvas.style.position = 'fixed';
			this.#debugCanvas.style.left = 0;
			this.#debugCanvas.style.top = 0;
			this.#debugCanvas.style.width = `${window.innerWidth}px`;
			this.#debugCanvas.style.height = `${window.innerHeight}px`;
			this.#debugCanvas.style.pointerEvents = 'none';
			this.#debugCanvas.style.zIndex = 9999999;

			this.#debugContext = this.#debugCanvas.getContext('2d');
		}

		if (this.#onResizeFunk) {
			this.#onResizeFunk();
		}

		this.#updateActiveAnimations();
	}

	triggerAnimations(all = false) {
		if (this.#debugContext) {
			this.#debugContext.clearRect(0, 0, this.#debugCanvas.width, this.#debugCanvas.height);
			this.#debugContext.strokeStyle = '#f00';
			this.#debugContext.lineWidth = 2 * this.#pixelRatio;
			this.#debugContext.beginPath();
		}

		const animations = all ? this.#animations : this.#activeAnimations;

		animations?.forEach(a => {
			this.#triggerAnimation(a)
		});

		if (this.#debugContext) {
			this.#debugContext.stroke();
		}
	}

	#triggerAnimation(a, isInView, ms) {
		const box = a.box;

		if (!box || !box.width || !box.height) {
			return;
		}

		const o = a.animationObject;

		o.scroll = this.scroll;

		if (a.smoothing && a.smoothScroll) {
			const deltaSeconds = (ms || 0) * 60 / 1000;

			o.smoothScrollValue = a.smoothScroll(o.scroll, deltaSeconds, a.smoothing);
		} else {
			o.smoothScrollValue = o.scroll;
		}

		const directionOffset = a.directionOffset || 0;
		const offset = a.offset || 0;

		const pos = box.top
			+ box.height
			- o.smoothScrollValue
			+ directionOffset * (this.isDown ? -1 : 1) * this.#height
			+ offset * this.#height

		const rawFactor = pos / (this.#height + box.height);
		const rawBoxFactor = (pos - this.#height) / box.height;

		o.rawFactor = ((1 - rawFactor) - 0.5) * a.speed + 0.5;
		o.rawBoxFactor = ((1 - rawBoxFactor) - 0.5) * a.speed + 0.5;
		o.factor = clamp(o.rawFactor, 0, 1);
		o.isInView = isInView ?? (o.rawFactor >= 0 && o.rawFactor <= 1);
		o.boxFactor = clamp(o.rawBoxFactor, 0, 1);
		o.boxIsInView = o.rawBoxFactor >= 0 && o.rawBoxFactor <= 1;
		o.box = box;
		o.item = a.item;
		o.index = a.index;

		if (o.fixedTop) {
			o.box.top = o.fixedTop;
		}

		if (o.isInView !== o.previousIsInView) {
			if (o.isInView) {
				if (a.smoothing) {
					a.smoothScroll = smoothValue(o.scroll);
				}

				o.isScrolledIn = true;

				if (o.isScrolledInOnce === undefined) {
					o.isScrolledInOnce = true;
				}
			} else if (o.previousIsInView !== undefined) {
				o.isScrolledOut = true;

				a.smoothScroll = null;

				if (o.isScrolledOutOnce === undefined) {
					o.isScrolledOutOnce = true;
				}
			}
		}

		if (a.animation && (a.previousFactor !== o.factor || (isInView !== undefined))) {
			a.animation(o);
			a.previousFactor = o.factor;
		}

		o.isScrolledIn = false;
		o.isScrolledOut = false;

		if (o.isScrolledInOnce === true) {
			o.isScrolledInOnce = false;
		}

		if (o.isScrolledOutOnce === true) {
			o.isScrolledOutOnce = false;
		}

		o.previousIsInView = o.isInView;

		if (this.#debugContext
			&& (o.box.top + box.height - o.scroll >= 0
			&& o.box.top - o.scroll <= this.#height)
		) {
			this.#debugContext.rect(
				o.box.left * this.#pixelRatio,
				(o.box.top - o.scroll) * this.#pixelRatio,
				o.box.width * this.#pixelRatio,
				o.box.height * this.#pixelRatio
			);
		}
	}

	#onScroll(scroll = 0) {
		this.isDown = scroll >= this.#previousScroll;

		if (!this.#activeAnimations) {
			return;
		}

		this.triggerAnimations();

		this.#previousScroll = scroll;
	}

	add(_items, callback, options = {}) {
		const items = _items && _items instanceof Array ? _items : [_items];

		if (options.observeIn === undefined) {
			// null is the browser viewport
			options.observeIn = null;
		}

		items.forEach((item, index) => {
			const animation = {
				animation      : callback,
				directionOffset: options.directionOffset || 0,
				offset         : options.offset || 0,
				speed          : options.speed === undefined ? 1 : options.speed,
				smoothing      : options.smoothing,
				animationObject: {
					centerOffset: 0,
					originalTop : 0,
					isVisible   : true,
					data        : options.data
				},
				item,
				index
			};

			// use intersection observer to only parse active animations
			let observer = null;

			if (window.IntersectionObserver && options.observeIn !== undefined) {
				observer = new window.IntersectionObserver(entries => {
					entries.forEach(entry => {
						animation.animationObject.isVisible = entry.isIntersecting;

						this.#triggerAnimation(animation, entry.isIntersecting);
						this.#updateActiveAnimations();
					});
				}, {
					root      : options.observeIn,
					rootMargin: `${options.directionOffset ? options.directionOffset * 100 : options.speed ? 1 / options.speed * 100 : 0}% 0% ${options.directionOffset ? options.directionOffset * 100 : options.offset ? options.offset * 100 : options.speed ? 1 / options.speed * 100 : 0}% 0%`,
					threshold : 0
				});

				observer.observe(item);
			} else {
				this.#activeAnimations = null;
			}

			animation.observer = observer;

			this.#initBox(animation);

			this.#animations.push(animation);
		});
	}

	#updateActiveAnimations() {
		const hasSmoothing = a => (a.smoothing && (a.animationObject.smoothScrollValue === a.animationObject.scroll) || Math.abs(a.animationObject.smoothScrollValue - a.animationObject.scroll) > this.#scrollThreshold);

		this.#activeAnimations = this.#animations.filter(a => a.animationObject.isVisible && !hasSmoothing(a));
		this.#smoothAnimations = this.#animations.filter(a => a.animationObject.isVisible && hasSmoothing(a));

		if (this.#debug) {
			console.log(`active animations: ${this.#activeAnimations.length}, smooth animations: ${this.#smoothAnimations.length})`);
		}
	}

	remove(_items) {
		const items = _items && _items instanceof Array ? _items : [_items];

		this.#animations.forEach(a => {
			if (items.indexOf(a.item) >= 0) {
				this.#triggerAnimation(a, false);
				a.observer?.unobserve?.(a.item);
			}
		});

		this.#animations = this.#animations.filter(a => items.indexOf(a.item) < 0);
	}

	static getBox(node) {
		let el = node;
		let x = 0;
		let y = 0;

		do {
			if (el.offsetLeft === undefined) {
				// svg?
				const bb = el.getBoundingClientRect();
				const html = window.document.documentElement;

				x += bb.left + window.pageXOffset - html.clientLeft;
				y += bb.top + window.pageYOffset - html.clientTop;
			} else {
				x += el.offsetLeft;
				y += el.offsetTop;
			}

			el = el.offsetParent;
		} while (el);

		if (node.offsetWidth === undefined) {
			const bb = node.getBoundingClientRect();

			return {
				left  : x,
				top   : y,
				width : bb.width,
				height: bb.height
			};
		}

		return {
			left  : x,
			top   : y,
			width : node.offsetWidth,
			height: node.offsetHeight
		};
	}

	#initBox(a) {
		a.box = SmoothScroller.getBox(a.item);
		a.animationObject.centerOffset = (this.#height - a.box.height) * 0.5;
		a.animationObject.originalTop = a.box.top;
		a.animationObject.scroll = a.animationObject.targetScroll = this.#targetScroll;
	}

	scrollTo(position = 0, time = null) {
		return this.#scrollTween
			.from({
				y: this.scroll
			})
			.to({
				y: position
			}, time ?? clamp(Math.abs(position - this.scroll) * 0.00025, 0.25, 2.5))
			.start();
	}

	scrollToElement(node, offset = 0, time = null) {
		const box = SmoothScroller.getBox(node);

		return this.scrollTo(box.top + offset, time);
	}

	reset() {
		this.#animations.length = 0;
		this.#height = 0;
	}

	stop() {
		this.#isAnimating = false;
	}

	lock() {
		this.isLocked = true;
	}

	unlock() {
		this.isLocked = false;
		window.scrollTo(0, this.scroll);
	}

	setContent(content) {
		this.#content = content;
		this.resize();
	}

	unsetContent() {
		this.#content = null;
	}

	setScrollDuration(value) {
		this.#scrollDuration = value;
	}

	setTouchScrollDuration(value) {
		this.#touchScrollDuration = value;
	}

	destroy() {
		if (this.#debug) {
			this.#debugCanvas.remove();
		}

		if (this.#listener) {
			if (this.#debug) {
				console.log('remove scroll listeners');
			}

			this.#listener.removeEventListener('touchstart', this.#touchStartListener, this.#passive);
			this.#listener.removeEventListener('wheel', this.#wheelListener, this.#passive);
			this.#listener.removeEventListener('mousedown', this.#mouseDownListener, this.#passive);
			this.#listener.removeEventListener('scroll', this.#scrollListener, this.#passive);
		}

		this.#animations.forEach(a => {
			a.observer?.unobserve?.(a.item);
		});

		this.reset();
		this.stop();
	}

}

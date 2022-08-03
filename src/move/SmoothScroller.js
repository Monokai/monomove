import clamp from '../math/clamp.js';
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

	#scrollThreshold = 0.01;
	#touchScrollFactor = 1;
	#targetScroll = 0;
	#previousScroll = 0;
	#height = 0;
	#animations = [];
	#activeAnimations = null;
	#debugCanvas = null;
	#debugContext = null;
	#isAnimating = false;
	#previousTime = 0;
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
	#scrollFactor = null;
	#container = null;
	#content = null;
	#listener = null;
	#debug = null;

	constructor({
		container = window.document.body,
		content = window.document.body,
		scrollFactor = 1,
		listener = window,
		debug = false
	} = {}) {
		this.#scrollFactor = scrollFactor;
		this.#container = container;
		this.#content = content;
		this.#listener = listener;
		this.#debug = debug;

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
			this.#targetScroll = this.getScrollPosition();
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

	#onTick() {
		if (this.isLocked) {
			return true;
		}

		this.scrollHeight = this.#content ? this.#content.scrollHeight : 0;

		if (this.scrollHeight !== this.#previousScrollHeight) {
			this.resize();
			this.scroll = this.#targetScroll;
			this.#onScroll(this.scroll);
			this.#previousScrollHeight = this.scrollHeight;

			return true;
		}

		if (!this.#isAnimating) {
			return true;
		}

		const dy = (this.#targetScroll - this.scroll) * (this.#isTouch ? this.#touchScrollFactor : this.#scrollFactor);

		if (Math.abs(dy) < this.#scrollThreshold) {
			console.log('stop scrolling', this.scroll);

			// trigger final animations on slow touch devices that can't keep up with intersection observers
			if (this.#isTouch) {
				console.log('trigger all animations');
				this.triggerAnimations(true);
			}

			this.#isAnimating = false;
		}

		this.scroll += dy;

		if (this.#isFirstScrollInstant) {
			this.#isFirstScrollInstant = false;
			this.scroll = this.#targetScroll;

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

		this.scroll = this.#previousScroll = this.#targetScroll;
		this.scrollHeight = this.#content.scrollHeight;
		this.#height = window.innerHeight;

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

		this.#updateActiveAnimations();
	}

	triggerAnimations(all = false) {
		const r = window.devicePixelRatio;

		if (this.#debugContext) {
			this.#debugContext.clearRect(0, 0, this.#debugCanvas.width, this.#debugCanvas.height);
			this.#debugContext.strokeStyle = '#f00';
			this.#debugContext.lineWidth = 2 * r;
			this.#debugContext.beginPath();
		}

		const animations = all ? this.#animations : this.#activeAnimations;

		animations.forEach(a => {
			const box = a.box;

			if (!box || !box.width || !box.height) {
				return;
			}

			const o = a.animationObject;

			o.scroll = this.scroll;

			const directionOffset = a.directionOffset || 0;
			const offset = a.offset || 0;
			const pos = box.top
				+ box.height
				- o.scroll
				+ directionOffset * (this.isDown ? -1 : 1) * this.#height
				+ offset * this.#height;

			const rawFactor = pos / (this.#height + box.height);
			const rawBoxFactor = (pos - this.#height) / box.height;

			o.rawFactor = ((1 - rawFactor) - 0.5) * a.speed + 0.5;
			o.rawBoxFactor = ((1 - rawBoxFactor) - 0.5) * a.speed + 0.5;
			o.factor = clamp(o.rawFactor, 0, 1);
			o.isInView = o.rawFactor >= 0 && o.rawFactor <= 1;
			o.boxFactor = clamp(o.rawBoxFactor, 0, 1);
			o.boxIsInView = o.rawBoxFactor >= 0 && o.rawBoxFactor <= 1;
			o.box = box;
			o.item = a.item;

			if (o.fixedTop) {
				o.box.top = o.fixedTop;
			}

			if (o.isInView !== o.previousIsInView) {
				if (o.isInView) {
					o.isScrolledIn = true;

					if (o.isScrolledInOnce === undefined) {
						o.isScrolledInOnce = true;
					}
				} else if (o.previousIsInView !== undefined) {
					o.isScrolledOut = true;

					if (o.isScrolledOutOnce === undefined) {
						o.isScrolledOutOnce = true;
					}
				}
			}

			if (a.animation && a.previousFactor !== o.factor) {
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
				&& (o.box.top + o.box.height - o.scroll >= 0
				&& o.box.top - o.scroll <= this.#height)
			) {
				this.#debugContext.rect(
					o.box.left * r,
					o.box.top * r - o.scroll * r,
					o.box.width * r,
					o.box.height * r
				);
			}
		});

		if (this.#debugContext) {
			this.#debugContext.stroke();
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

		items.forEach(item => {
			const animationObject = {
				centerOffset: 0,
				originalTop : 0,
				isVisible   : true
			};

			// use intersection observer to only parse active animations
			let observer = null;

			if (window.IntersectionObserver && options.observeIn !== undefined) {
				observer = new window.IntersectionObserver(entries => {
					entries.forEach(entry => {
						animationObject.isVisible = entry.isIntersecting;
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

			const animation = {
				animation      : callback,
				directionOffset: options.directionOffset || 0,
				offset         : options.offset || 0,
				speed          : options.speed === undefined ? 1 : options.speed,
				animationObject,
				item,
				observer
			};

			this.#initBox(animation);

			this.#animations.push(animation);
		});
	}

	#updateActiveAnimations() {
		this.#activeAnimations = this.#animations.filter(a => a.animationObject.isVisible);

		if (this.#debug) {
			console.log(`active animations: ${this.#activeAnimations.length}`);
		}
	}

	remove(_items) {
		const items = _items && _items instanceof Array ? _items : [_items];

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

		return this.scrollTo(box.top, offset, time);
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

		this.reset();
		this.stop();
	}

}

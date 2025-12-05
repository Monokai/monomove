// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	Tween,
	Timeline,
	TweenManager,
	CubicBezier,
	RenderLoop,
	delay,
	SmoothScroller
} from '../src/index';

describe('Monomove Test Suite', () => {

	let rafCallbacks: { id: number, cb: FrameRequestCallback }[] = [];
	let currentTime = 1000;
	let rafIdCounter = 0;

	const tick = (ms: number) => {
		currentTime += ms;
		const callbacksToRun = [...rafCallbacks];
		rafCallbacks = [];
		callbacksToRun.forEach(({ cb }) => cb(currentTime));
	};

	beforeEach(() => {
		RenderLoop.reset();
		TweenManager.removeAll();

		rafCallbacks = [];
		currentTime = 1000;
		rafIdCounter = 0;

		vi.spyOn(window.performance, 'now').mockImplementation(() => currentTime);

		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
			const id = ++rafIdCounter;
			rafCallbacks.push({ id, cb });
			return id;
		});

		vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((idToCancel) => {
			rafCallbacks = rafCallbacks.filter(({ id }) => id !== idToCancel);
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Core Engine (RenderLoop)', () => {
		it('should calculate accurate deltas', () => {
			let capturedDelta = -1;
			RenderLoop.add((ms) => {
				capturedDelta = ms;
				return true;
			});
			RenderLoop.play();

			tick(0);

			tick(16);
			expect(capturedDelta).toBe(16);

			tick(33);
			expect(capturedDelta).toBe(33);
		});

		it('should pause and resume correctly without time jumps', () => {
			const t = new Tween({ x: 0 }, 1).to({ x: 100 });
			t.startTween(currentTime);

			tick(0);
			tick(500);
			expect(t.progress).toBe(0.5);

			RenderLoop.pause();
			currentTime += 5000;
			expect(rafCallbacks.length).toBe(0);

			RenderLoop.play();

			tick(0);
			expect(t.progress).toBeCloseTo(0.5);

			tick(500);
			expect(t.progress).toBe(1);
		});
	});

	describe('Tween Mechanics', () => {
		it('should interpolate multiple properties simultaneously', () => {
			const target = { x: 0, y: 100, z: 5 };

			new Tween(target, 1)
				.to({ x: 10, y: 200, z: 5 })
				.startTween(currentTime);

			tick(0);
			tick(500);

			expect(target.x).toBe(5);
			expect(target.y).toBe(150);
			expect(target.z).toBe(5);
		});

		it('should merge properties in chained .to() calls', () => {
			const target = { x: 0, y: 0 };
			const tween = new Tween(target, 1)
				.to({ x: 100 })
				.to({ y: 100 });

			tween.startTween(currentTime);

			tick(0);
			tick(1000);

			expect(target.x).toBe(100);
			expect(target.y).toBe(100);
		});

		it('should handle .from() overrides', () => {
			const target = { x: 0 };

			new Tween(target, 1)
				.from({ x: 50 })
				.to({ x: 100 })
				.startTween(currentTime);

			tick(0);
			expect(target.x).toBe(50);

			tick(500);
			expect(target.x).toBe(75);
		});

		it('should support scalar (function) targets', () => {
			const spy = vi.fn();

			new Tween(spy, 1).startTween(currentTime);

			tick(0);
			tick(500);
			expect(spy).toHaveBeenLastCalledWith(0.5, 0.5, 500);
		});

		it('should handle 0 duration (instant)', () => {
			const target = { x: 0 };
			const tween = new Tween(target, 0).to({ x: 100 });
			tween.startTween(currentTime);
			expect(target.x).toBe(100);
			expect(tween.isPlaying).toBe(false);
		});

		it('should resolve the promise on complete', async () => {
			const target = { x: 0 };
			const tween = new Tween(target, 0.1).to({ x: 100 });
			const promise = tween.start(currentTime);

			tick(0);
			tick(50);
			tick(50);

			await expect(promise).resolves.toBe(tween);

			expect(target.x).toBe(100);
		});
	});

	describe('Tween Lifecycle', () => {
		it('should fire callbacks in correct order', () => {
			const onStart = vi.fn();
			const onUpdate = vi.fn();
			const onComplete = vi.fn();
			const target = { x: 0 };

			new Tween(target, 0.1)
				.to({ x: 10 })
				.onStart(onStart)
				.onUpdate(onUpdate)
				.onComplete(onComplete)
				.startTween(currentTime);

			tick(0);
			expect(onStart).toHaveBeenCalledTimes(1);
			expect(onUpdate).toHaveBeenCalled();
			expect(onComplete).not.toHaveBeenCalled();

			tick(100);
			expect(onComplete).toHaveBeenCalledTimes(1);
			expect(target.x).toBe(10);
		});

		it('should handle finite loops', () => {
			const target = { x: 0 };
			const onLoop = vi.fn();
			const tween = new Tween(target, 1)
				.to({ x: 10 })
				.loop(2)
				.setLoopCallback(onLoop)
				.startTween(currentTime);

			tick(0);

			tick(1000);
			expect(onLoop).toHaveBeenCalledWith(target, 0);
			expect(tween.isPlaying).toBe(true);

			tick(1000);
			expect(onLoop).toHaveBeenCalledWith(target, 1);
			expect(tween.isPlaying).toBe(true);

			tick(1000);
			expect(tween.isPlaying).toBe(false);
			expect(onLoop).toHaveBeenCalledTimes(2);
		});

		it('should stop and restart correctly', () => {
			const target = { x: 0 };
			const tween = new Tween(target, 1).to({ x: 100 });

			tween.startTween(currentTime);
			tick(500);
			expect(target.x).toBe(50);

			tween.stop();
			tick(500);
			expect(target.x).toBe(50);

			tween.restart();
			expect(target.x).toBe(0);

			tick(500);
			expect(target.x).toBe(50);
		});
	});

	describe('Timeline Composition', () => {
		it('should sequence items sequentially', () => {
			const t1 = new Tween({ val: 0 }, 1).to({ val: 1 });
			const t2 = new Tween({ val: 0 }, 1).to({ val: 1 });
			const tl = new Timeline().add(t1).add(t2);

			expect(tl.totalTime).toBe(2000);

			tl.setPosition(0.25);
			expect(t1.progress).toBe(0.5);
			expect(t2.progress).toBe(0);

			tl.setPosition(0.75);
			expect(t1.progress).toBe(1);
			expect(t2.progress).toBe(0.5);
		});

		it('should handle negative offsets (overlap)', () => {
			const t1 = new Tween({ x: 0 }, 1);
			const t2 = new Tween({ x: 0 }, 1);
			const tl = new Timeline().add(t1).add(t2, -0.5);

			expect(tl.totalTime).toBe(1500);

			tl.setPosition(0.5);
			expect(t1.progress).toBe(0.75);
			expect(t2.progress).toBe(0.25);
		});

		it('should handle absolute positioning (.at)', () => {
			const t1 = new Tween({ x: 0 }, 1);
			const tl = new Timeline().at(2, t1);

			expect(tl.totalTime).toBe(3000);

			tl.setPosition(0.5);
			expect(t1.progress).toBe(0);

			tl.setPosition(2.5 / 3);
			expect(t1.progress).toBe(0.5);
		});

		it('should play via .start()', async () => {
			const o = { x: 0 }
			const t1 = new Tween(o, 1).to({ x: 100 });
			const tl = new Timeline().add(t1);

			tl.start();
			tick(0);

			tick(500);
			expect(o.x).toBe(50);

			tick(500);
			expect(o.x).toBe(100);
		});
	});

	describe('Timeline Scrubbing & Visibility', () => {
		it('should trigger visibility callbacks during scrubbing', () => {
			const t1 = new Tween({ x: 0 }, 1);
			const onVisible = vi.fn();
			const onInvisible = vi.fn();

			t1.onTimelineVisible(onVisible).onTimelineInvisible(onInvisible);
			const tl = new Timeline().at(1, t1);

			tl.setPosition(0);
			vi.clearAllMocks();

			tl.setPosition(0.5);
			expect(onVisible).toHaveBeenCalled();
			expect(onInvisible).not.toHaveBeenCalled();
			vi.clearAllMocks();

			tl.setPosition(0.2);
			expect(onVisible).not.toHaveBeenCalled();
			expect(onInvisible).toHaveBeenCalled();
		});

		it('should handle "Timeline In" state correctly', () => {
			const t1 = new Tween({ x: 0 }, 1);
			const onIn = vi.fn();
			const onOut = vi.fn();

			t1.onTimelineIn(onIn).onTimelineOut(onOut);
			const tl = new Timeline().add(t1);

			tl.setPosition(0.5);
			expect(onIn).toHaveBeenCalled();

			tl.setPosition(1);
			expect(onOut).toHaveBeenCalled();
		});
	});

	describe('Easing & Bezier', () => {
		it('should use presets', () => {
			const t = new Tween({ x: 0 }, 1).to({ x: 100 }).easing('easeInQuad');
			t.startTween(currentTime);
			tick(0);
			tick(500);
			expect(t.progress).toBeCloseTo(0.25, 1);
		});

		it('should accept custom Bezier data', () => {
			const bezier = new CubicBezier(0, 1, 1, 0);
			expect(bezier.get(0)).toBe(0);
			expect(bezier.get(1)).toBe(1);

			const t = new Tween({ x: 0 }, 1).easing(bezier);
			t.startTween(currentTime);
			tick(250);
			expect(t.progress).toBeGreaterThan(0.25);

			tick(250);
			expect(t.progress).toBeCloseTo(0.5);
		});

		it('should clamp values appropriately', () => {
			const t = new Tween({ x: 0 }, 1).to({ x: 100 });
			t.startTween(currentTime);

			tick(2000);
			expect(t.progress).toBe(1);
		});
	});

	describe('Utilities', () => {
		it('should create a delay promise', async () => {
			const p = delay(0.1);
			let done = false;
			p.then(() => { done = true; });

			tick(0);
			expect(done).toBe(false);

			tick(150);
			await new Promise(r => setTimeout(r, 0));
			expect(done).toBe(true);
		});
	});

	describe('SmoothScroller', () => {

		let scroller: SmoothScroller;
		let element: HTMLElement;

		const VIEWPORT_HEIGHT = 1000;
		const ELEMENT_TOP = 2000;
		const ELEMENT_HEIGHT = 100;

		beforeEach(() => {
			Object.defineProperty(window, 'innerHeight', { value: VIEWPORT_HEIGHT, configurable: true });
			Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
			Object.defineProperty(document.body, 'scrollHeight', { value: 5000, configurable: true });
			Object.defineProperty(document.body, 'scrollWidth', { value: 1000, configurable: true });

			const originalObserver = window.IntersectionObserver;
			// @ts-ignore
			window.IntersectionObserver = undefined;

			element = document.createElement('div');

			vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
				top: ELEMENT_TOP,
				left: 0,
				width: 100,
				height: ELEMENT_HEIGHT,
				bottom: ELEMENT_TOP + ELEMENT_HEIGHT,
				right: 100,
				x: 0,
				y: ELEMENT_TOP,
				toJSON: () => {}
			});

			scroller = new SmoothScroller({
				scrollDuration: 0
			});
		});

		afterEach(() => {
			scroller.destroy();
		});

		it('should trigger onUpdate when passed via options object', () => {
			const onUpdate = vi.fn();

			scroller.add(element, {
				onUpdate: onUpdate
			});

			// Enter
			window.scrollY = 1500;
			window.dispatchEvent(new Event('scroll'));
			tick(16);

			expect(onUpdate).toHaveBeenCalled();
		});

		it('should trigger onScrolledIn when element enters viewport', () => {
			const onIn = vi.fn();
			const onOut = vi.fn();

			scroller.add(element, () => {}, {
				onScrolledIn: onIn,
				onScrolledOut: onOut
			});

			tick(16);
			expect(onIn).not.toHaveBeenCalled();

			window.scrollY = 1500;
			window.dispatchEvent(new Event('scroll'));

			tick(16);

			expect(onIn).toHaveBeenCalledTimes(1);
			expect(onOut).not.toHaveBeenCalled();
		});

		it('should trigger onScrolledOut when element leaves viewport', () => {
			const onIn = vi.fn();
			const onOut = vi.fn();

			scroller.add(element, () => {}, {
				onScrolledIn: onIn,
				onScrolledOut: onOut
			});

			tick(16);
			// expect(onIn).not.toHaveBeenCalled();

			// 1. Scroll In
			window.scrollY = 1500;
			window.dispatchEvent(new Event('scroll'));

			tick(16);

			expect(onIn).toHaveBeenCalledTimes(1);

			// // 2. Scroll Out (Back to top)
			window.scrollY = 0;
			window.dispatchEvent(new Event('scroll'));

			tick(16);

			expect(onOut).toHaveBeenCalledTimes(1);
		});

		it('should trigger onScrolledInOnce only once', () => {
			const onInOnce = vi.fn();

			scroller.add(element, () => {}, {
				onScrolledInOnce: onInOnce
			});

			tick(16);

			window.scrollY = 1500;
			window.dispatchEvent(new Event('scroll'));

			tick(16);

			expect(onInOnce).toHaveBeenCalledTimes(1);

			window.scrollY = 0;
			window.dispatchEvent(new Event('scroll'));
			tick(16);

			window.scrollY = 1500;
			window.dispatchEvent(new Event('scroll'));
			tick(16);
			expect(onInOnce).toHaveBeenCalledTimes(1);
		});

		it('should trigger onScrolledOutOnce only once', () => {
			const onOutOnce = vi.fn();

			scroller.add(element, () => {}, {
				onScrolledOutOnce: onOutOnce
			});

			tick(16);

			window.scrollY = 1500;
			window.dispatchEvent(new Event('scroll'));
			tick(16);
			expect(onOutOnce).not.toHaveBeenCalled();

			window.scrollY = 0;
			window.dispatchEvent(new Event('scroll'));
			tick(16);
			expect(onOutOnce).toHaveBeenCalledTimes(1);

			window.scrollY = 1500;
			window.dispatchEvent(new Event('scroll'));
			tick(16);

			window.scrollY = 0;
			window.dispatchEvent(new Event('scroll'));
			tick(16);
			expect(onOutOnce).toHaveBeenCalledTimes(1);
		});
	});

});
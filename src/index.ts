import { Tween } from './move/Tween.js';
import { Timeline } from './move/Timeline.js';
import { SmoothScroller } from './move/SmoothScroller.js';
import {
	TweenableObject,
	EasingType,
	ScalarUpdateCallback,
	IScalarTween,
	IObjectTween,
	ScrollItemOptions,
	SmoothScrollOptions,
	SmoothScrollCallback
} from './types.js';

export { CubicBezier } from './math/CubicBezier.js';
export { TweenManager } from './move/TweenManager.js';
export { RenderLoop } from './move/RenderLoop.js';
export * from './types.js';

export { Tween, Timeline, SmoothScroller };

export function tween(): IScalarTween;
export function tween(target: ScalarUpdateCallback, duration?: number): IScalarTween;
export function tween<T extends TweenableObject>(target: T, duration?: number): IObjectTween<T>;
export function tween<T extends TweenableObject>(
	target?: T | ScalarUpdateCallback,
	duration: number = 1
): IScalarTween | IObjectTween<T> {
	return new Tween(target as T | ScalarUpdateCallback, duration) as unknown as
		| IScalarTween
		| IObjectTween<T>;
}

export function animate<T extends TweenableObject>(
	target: T,
	to: Partial<T>,
	duration: number = 1,
	easing: EasingType = 'linear'
): Promise<IObjectTween<T>> {
	return tween(target, duration).to(to).easing(easing).start();
}

export function timeline(options?: { delay?: number }): Timeline {
	return new Timeline(options);
}

export const delay = async (seconds: number) => {
	return tween().duration(seconds).start();
};

export function smoothScroll(
	items: HTMLElement | HTMLElement[],
	callback: SmoothScrollCallback,
	options: ScrollItemOptions = {},
	scrollerOptions: SmoothScrollOptions = {}
): SmoothScroller {
	const scroller = new SmoothScroller(scrollerOptions);

	scroller.add(items, callback, options);

	return scroller;
}

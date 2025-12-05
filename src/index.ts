/**
 * @license
 * Monomove - utilities for moving things
 *
 * Copyright © 2021-2025 Monokai (monokai.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Tween } from './move/Tween.js';
import { Timeline } from './move/Timeline.js';
import { SmoothScroller } from './move/SmoothScroller.js';
import {
	TweenableObject,
	EasingType,
	SmoothScrollCallback,
	ScrollItemOptions,
	SmoothScrollOptions
} from './types.js';

export { CubicBezier } from './math/CubicBezier.js';
export { TweenManager } from './move/TweenManager.js';
export { RenderLoop } from './move/RenderLoop.js';
export * from './types.js';

export { Tween, Timeline, SmoothScroller };

export function animate<T extends TweenableObject>(
	target: T,
	to: Partial<T>,
	duration: number = 1,
	easing: EasingType = 'linear'
): Promise<Tween<T>> {
	return new Tween(target, duration)
		.to(to)
		.easing(easing)
		.start();
}

export function timeline(options?: { delay?: number }): Timeline {
	return new Timeline(options);
}

export const delay = async (seconds: number) => {
	return new Tween({}, seconds).start();
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

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
import { TweenableObject, EasingType, SmoothScrollCallback, ScrollItemOptions, SmoothScrollOptions } from './types.js';

// Export Core Classes
export { CubicBezier } from './math/CubicBezier.js';
export { TweenManager } from './move/TweenManager.js';
// export { Timeline } from './move/Timeline.js';
export { TweenChain } from './move/TweenChain.js'; 
// export { SmoothScroller } from './move/SmoothScroller.js';
export { RenderLoop } from './move/RenderLoop.js';
export * from './types.js';

// export const Tween = Tween;
export { Tween, Timeline, SmoothScroller };

// --- Functional API (DX Improvements) ---

/**
 * Animate an object's properties to specific values.
 * 
 * @example
 * animate(element.style, { opacity: 1, top: 100 }, 1.5, 'easeOut');
 */
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

/**
 * Create a new timeline sequence.
 * 
 * @example
 * const tl = timeline({ delay: 0.5 })
 *   .add(tween1)
 *   .add(tween2, -0.2); // overlap
 * tl.start();
 */
export function timeline(options?: { delay?: number }): Timeline {
    return new Timeline(options);
}

/**
 * Creates a delay promise.
 */
export const delay = async (seconds: number) => {
    return new Tween({}, seconds).start();
};

/**
 * Helper to create a SmoothScroller instance with default settings.
 */
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
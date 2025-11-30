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

import MMTween from './move/Tween.js';

export {default as CubicBezier} from './math/CubicBezier.js';
export {default as TweenManager} from './move/TweenManager.js';
export {default as TweenChain} from './move/TweenChain.js';
export {default as Timeline} from './move/Timeline.js';
export {default as SmoothScroller} from './move/SmoothScroller.js';
export {default as RenderLoop} from './move/RenderLoop.js';

export * from './types.js';

export const Tween = MMTween;

export const delay = async (x: number) => new MMTween(() => { return; }, 0).delay(x).start();


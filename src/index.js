/**
 * @license
 * Monomove
 * Utilities for moving things on screen
 * © 2021-2022 Monokai
*/

import MMTween from './move/Tween.js';

export {default as TweenManager} from './move/TweenManager.js';
export {default as TweenChain} from './move/TweenChain.js';
export {default as Timeline} from './move/Timeline.js';
export {default as SmoothScroller} from './move/SmoothScroller.js';
export {default as RenderLoop} from './move/RenderLoop.js';

export const Tween = MMTween;

export const delay = async x => new MMTween(() => true, 0).delay(x).start();

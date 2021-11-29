/**
 * @license
 * Monomove
 * Utilities for moving things on screen
 * © 2021 Monokai
*/

import MMTween from './move/Tween';

export {default as TweenManager} from './move/TweenManager';
export {default as TweenChain} from './move/TweenChain';
export {default as Timeline} from './move/Timeline';
export {default as SmoothScroller} from './move/SmoothScroller';
export {default as RenderLoop} from './move/RenderLoop';

export const Tween = MMTween;

export const delay = async x => new MMTween(() => true, 0).delay(x).start();

/** @license
	Monomove © 2021 Monokai
	Utilities for moving things on screen
*/

import MMTween from './move/Tween';

export {default as TweenManager} from './move/TweenManager';
export {default as TweenChain} from './move/TweenChain';
export {default as Timeline} from './move/Timeline';
export {default as SmoothScroller} from './move/SmoothScroller';
export {default as RenderLoop} from './move/RenderLoop';

export const Tween = MMTween;

export const delay = async x => await new MMTween(() => true, x).start();

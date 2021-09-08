/** @license
	Monomove © 2021 Monokai
	Utilities for moving things on screen
*/

export {default as Tween} from './move/Tween';
export {default as TweenManager} from './move/TweenManager';
export {default as Timeline} from './move/Timeline';
export {default as SmoothScroller} from './move/SmoothScroller';
export {default as RenderLoop} from './move/RenderLoop';

export const delay = async x => await new Tween(() => true, x).start();

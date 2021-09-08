/** @license
	Monomove © 2021 Monokai
	Utilities for moving things on screen
*/

export Tween from './move/Tween';
export TweenManager from './move/TweenManager';
export Timeline from './move/Timeline';
export SmoothScroller from './move/SmoothScroller';
export RenderLoop from './move/RenderLoop';

export const delay = async x => await new Tween(() => true, x).start();

/** @license
	Monomove © 2021 Monokai
	Utilities for moving things on screen
*/

export const Tween from './move/Tween';
export const TweenManager from './move/TweenManager';
export const Timeline from './move/Timeline';
export const SmoothScroller from './move/SmoothScroller';
export const RenderLoop from './move/RenderLoop';

export const delay = async x => await new Tween(() => true, x).start();

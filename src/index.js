/** @license
	Monomove © 2021 Monokai
	Utilities for moving things on screen
*/

import MMTween from './move/Tween';
import MMSmoothScroller from './move/SmoothScroller';
import MMRenderLoop from './move/RenderLoop';

export const delay = async x => await new MMTween(() => true, x).start();
export const Tween = MMTween;
export const SmoothScroller = MMSmoothScroller;
export const RenderLoop = MMRenderLoop;

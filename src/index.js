/** @license
	Monomove © 2021 Monokai
	Utilities for moving things on screen
*/

import MMTween from './move/Tween';

export const delay = async x => await new Tween(() => true, x).start();
export const Tween = MMTween;
export const SmoothScroller = require('move/SmoothScroller').default;
export const RenderLoop = require('move/RenderLoop').default;

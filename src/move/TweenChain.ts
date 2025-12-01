import { Timeline } from './Timeline.js';
import type { ITween } from '../types.js';

/**
 * @deprecated TweenChain is deprecated. Please use Timeline instead.
 * This class maps the old array-based constructor to the new Timeline.add API.
 */
export class TweenChain extends Timeline {
	constructor(tweens: ITween[], options: { delay?: number } = {}) {
		super(options);

		// Add all tweens sequentially
		for (let i = 0; i < tweens.length; i++) {
			this.add(tweens[i]);
		}
	}
}

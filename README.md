# Monomove

A minimal, high-performance, strictly typed animation and smooth scrolling library for the modern web.

---

## Installation

```bash
npm install @monokai/monomove
```

## Quick Start

### Object Animation
Tween properties of an object.

```ts
import { tween } from '@monokai/monomove';

const box = { x: 0, opacity: 0 };

tween(box)
	.to({ x: 100, opacity: 1 }, 1.5)
	.easing('easeOutExpo') 
	.onUpdate((target) => {
		element.style.transform = `translateX(${target.x}px)`;
		element.style.opacity = target.opacity.toString();
	})
	.start();
```

### Scalar Animation
Tween a single value from 0 to 1 (or custom range).

```ts
import { tween } from '@monokai/monomove';

tween(val => {
	element.style.opacity = val.toString();
}, 0.5)
	.from(0)
	.to(1)
	.start();
```

### Easing Presets
To keep the core library small, easing presets are not included by default.

Option A: The "Magic" Import (Easiest)
Import the presets side-effect file once in your app. This registers all standard CSS easings (easeIn, easeOutExpo, etc.) globally.

```ts
import '@monokai/monomove/easings';
import { tween } from '@monokai/monomove';

tween(obj).to({ x: 100 }).easing('easeOutBack').start();
```

Option B: Tree-Shakable (Smallest Bundle)
Import only the specific curves you need to save bytes.

```ts
import { tween, TweenManager } from '@monokai/monomove';
import { BezierPresets } from '@monokai/monomove/easings';

TweenManager.register('bounce', BezierPresets.easeOutBack);

tween(obj).easing('bounce').start();
```

### API Reference

```ts
tween(target, duration?)
```

The main factory function. Returns strictly typed IScalarTween or IObjectTween.

Methods:

|	Method	|	Arguments	|	Description	|
| :--- | :--- | :--- |
|	.to(props, duration?)	|	Partial<T> | number, number	|	Define end values and optionally update duration.	|
|	.from(props)	|	Partial<T> | number	|	Define start values (defaults to current values).	|
|	.duration(seconds)	|	number	|	Set duration in seconds.	|
|	.delay(seconds)	|	number	|	Wait before starting.	|
|	.easing(type)	|	string | Array | Function	|	Set easing curve.	|
|	.loop(count)	|	number	|	Loop the animation n times (Infinity for endless).	|
|	.onUpdate(cb)	|	(obj, progress, delta) => void	|	Called every frame.	|
|	.onComplete(cb)	|	(obj) => void	|	Called when animation finishes.	|
|	.onStart(cb)	|	(obj) => void	|	Called when animation begins (after delay).	|
|	.start()	|	-	|	Starts the tween. Returns a Promise.	|
|	.stop()	|	-	|	Stops the tween immediately.	|

```ts
timeline(options?)
```

Sequence multiple tweens together.

```ts
import { timeline, tween } from '@monokai/monomove';

const tl = timeline({ delay: 0.5, onComplete: () => console.log('Done') });

tl.add(tween(obj).to({ x: 100 }, 1))
	.add(tween(obj).to({ y: 100 }, 1), -0.5) // Overlap by 0.5s
	.start();
```

|	Method	|	Description	|
| :--- | :--- |
|	.add(tween, offset?)	|	Add a tween. offset (seconds) shifts it relative to the previous tween's end.	|
|	.at(time, tween)	|	Insert a tween at an absolute timestamp.	|
|	.timeScale(scale)	|	Speed up (2), slow down (0.5), or reverse (-1) the timeline.	|
|	.loop(count)	|	Loop the entire sequence.	|
|	.setProgress(0-1)	|	Scrub the timeline manually.	|

### SmoothScroller

A high-performance scroller that uses IntersectionObserver to trigger animations only when elements are in view. It does not hijack native scrolling (unless you build a custom smooth scroll container), making it accessibility-friendly.

```ts
import { SmoothScroller } from '@monokai/monomove';

const scroller = new SmoothScroller({
	scrollDuration: 0.5, // 0 = native
	listener: window
});

const elements = document.querySelectorAll('.card');

scroller.add(Array.from(elements), (data) => {
	const y = (1 - data.boxFactor) * 100; 

	data.item.style.transform = `translateY(${y}px)`;

	if (data.isInView) {
		data.item.style.opacity = '1';
	}
});
```

#### Callback Data Object
The callback receives a rich data object for math-based animations:

|	Property	|	Type	|	Description	|
| :--- | :--- | :--- |
|	item	|	HTMLElement	|	The DOM element.	|
|	scroll	|	number	|	Current scroll Y position.	|
|	factor	|	0 to 1	|	Viewport Progress: 0 = entering bottom, 1 = leaving top.	|
|	boxFactor	|	0 to 1	|	Box Progress: 0 = top of item at bottom of screen, 1 = bottom of item at top of screen.	|
|	isInView	|	boolean	|	Is the element currently visible?	|

### Helper Utilities

```ts
animate(target, to, duration, easing)
```

A simple "fire-and-forget" wrapper.

```ts
import { animate } from '@monokai/monomove';

await animate(element.style, { opacity: 0 }, 0.5, 'linear');

element.remove();
```

```ts
delay(seconds)
```

Promise-based delay.

```ts
import { delay } from '@monokai/monomove';

await delay(1);

console.log('1 second passed');
```

### RenderLoop
Hook into the library's single requestAnimationFrame loop.

```ts
import { RenderLoop } from '@monokai/monomove';

const stop = RenderLoop.add((deltaMS) => {
	// Custom logic running every frame
	return true; // return false to remove automatically
});
```

License
MIT © Monokai
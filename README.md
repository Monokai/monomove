# Monomove
## Utilities for moving things on screen

I've been consistently using some form of these tools over the years to add transitions and animations to web apps. Its aim is to be a minimal toolkit for adding interaction and movement to web apps.

It consists of a couple of components:

- Tween (animation tweening)
- TweenManager (manages the tweens)
- RenderLoop (manages rendering via `requestAnimationFrame`)
- delay (simple utility)
- SmoothScroller (reacts on scrolling events)

## Install

```sh
npm install --save-dev monomove
```



## Tween

A minimal animation tweening utility.

### Importing it:

```js
import {Tween} from 'monomove';
```

### Using it

Simple animation, tweening the opacity:

```js
const element = document.getElementById('my-id');
const duration = 0.2 // seconds

await new Tween({value} => {
	element.style.opacity = value;
}, duration)
	.start();
```

Tweening position with easing:

```js
await new Tween({value} => {
	element.style.left = `${value * 100}px`;
}, duration)
	.easing('0.25, 0.25, 0, 1') // css style easing
	.start();
```

Alternative invocation with any object:

```js
await new Tween({
	x: 0,
	y: 0
}, duration)
	.to({
		x: 100,
		y: 200
	})
	.onUpdate({x, y} => {
		element.style.transform = `translate3d(${x * 100}px, ${y * 100}px, 0)`;
	})
	.start();
```



## TweenManager

### Importing it:

```js
import {TweenManager} from 'monomove';
```

The tween manager takes care of running and cleaning up tween instances. Whenever you want to immediately delete tweens, you can use this class

### Removing all tweens

```js
TweenManager.removeAll();
```



## RenderLoop

### Importing it:

```js
import {RenderLoop} from 'monomove';
```

The main responsibility of the render loop is to keep track of the time and triggering the tweens on each drawing frame of the browser. 

### Hook up your own render function

```js
function onTick(ms) {
	console.log(`elapsed milliseconds: ${ms}`);
}

RenderLoop.add(this, onTick);
```

### Remove it

```js
RenderLoop.remove(this, onTick);
```

### Remove all hooks on the `this` context

```js
RenderLoop.remove(this);
```



## delay

### Importing it:

```js
import {delay} from 'monomove';
```

A simple utility to wait a bit without relying on `setTimeout`;

### Wait for a 3 seconds

```js
await delay(3);
```



## SmoothScroller

The Smooth Scroller lets you control DOM elements based on the scroll position in the browser

### Importing it:

```js
import {SmoothScroller} from 'monomove';
```

### Using it

```js
const smoothScroller = new SmoothScroller();
```

### Scroll browser page to position 100 in 3 seconds

```js
smoothScroller.scrollTo(100, 3);
```

### Scroll browser page to element with 100px offset in 3 seconds

```js
smoothScroller.scrollToElement(document.getElementById('my-element'), 100, 3);
```

### Change opacity of multiple elements based on their individual position in the browser frame

```js
smoothScroller.add([...document.getElementsByClassName('block')], {
	factor,
	item
} => {
	item.style.opacity = 1 - ((factor - 0.5) * 2) ** 4;
});
```

The callback offers a couple of variables:

- `item`: the DOM element
- `box`: the position and dimensions of the item
- `rawFactor`: value indicating normalized scroll position: measures from the top of the item at the bottom of the browser page to the bottom of the item at the **top** of the browser page
- `rawBoxFactor`: value indicating normalized box scroll position: measures from the top of the item at the bottom of the browser page to the bottom of the item at the **bottom** of the browser page
- `factor`: `rawFactor` clamped to [0, 1]
- `boxFactor`: `rawBoxFactor` clamped to [0, 1] 
- `isInView`: boolean indicating if item is in view
- `boxIsInView`: boolean indicating if the box of the item is in view

### Destroying it

```js
smoothScroller.destroy();
```
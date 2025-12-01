export interface BezierLike {
	get(t: number): number;
	setIterations?(iter: number): void;
	setCacheSize?(size: number): void;
}

export type EasingFunction = (t: number) => number;

export type EasingType = string | EasingFunction | BezierLike;

// Strict definition allows T[keyof T] to be treated as number
export type TweenableObject = Record<string, number>;

// Specific callback types
export type ObjectUpdateCallback<T> = (object: T, value: number, delta: number) => void;
export type ScalarUpdateCallback = (value: number, progress: number, delta: number) => void;

// Union type for internal storage
export type UpdateCallback<T> = ObjectUpdateCallback<T> | ScalarUpdateCallback;

export type CompleteCallback<T> = (object: T, time: number) => void;
export type LoopCallback<T> = (object: T, loopCount: number) => void;
export type StartCallback<T> = (object: T) => void;
export type TimelineCallback<T> = (object: T) => void;

export interface ITween {
	start(): Promise<ITween>;
	stop(): ITween;
	update(time: number): boolean; // returns false if finished
	startTime: number | null;
	delayTime: number;
	durationMS: number;
	totalTime?: number; // Used in Timelines
	
	delay(amount: number): ITween;
	
	setPosition(position: number): void;
	invalidate(): void;
	updateAllValues(delta?: number): void;
	value: number;
	easingFunction: EasingFunction;
}

export interface SmoothScrollCallbackData {
	item: HTMLElement;
	factor: number; // 0 to 1 based on viewport position
	rawFactor: number; // Unclamped factor
	rawBoxFactor: number;
	boxFactor: number;
	box: DOMRectLike;
	scroll: number;
	smoothScrollValue: number;
	isInView: boolean;
	boxIsInView: boolean;
	index: number;
	fixedTop?: number;
	isScrolledIn?: boolean;
	isScrolledOut?: boolean;
	isScrolledInOnce?: boolean;
	isScrolledOutOnce?: boolean;
	previousIsInView?: boolean;
	centerOffset: number;
	originalTop: number;
	isVisible: boolean;
	data?: unknown; // User data is truly unknown
}

export type SmoothScrollCallback = (data: SmoothScrollCallbackData) => void;

export interface DOMRectLike {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface SmoothScrollOptions {
	container?: HTMLElement;
	content?: HTMLElement;
	easing?: EasingFunction;
	scrollFactor?: number | null; // Deprecated
	scrollDuration?: number;
	listener?: Window | HTMLElement;
	debug?: boolean;
	onResize?: () => void;
}

export interface ScrollItemOptions {
	observeIn?: HTMLElement | null; // null for viewport
	directionOffset?: number;
	offset?: number;
	speed?: number;
	smoothing?: number;
	data?: unknown;
}

export interface ScrollAnimationEntry {
	animation: SmoothScrollCallback;
	directionOffset: number;
	offset: number;
	speed: number;
	smoothing?: number;
	animationObject: SmoothScrollCallbackData;
	item: HTMLElement;
	index: number;
	observer: IntersectionObserver | null;
	box: DOMRectLike;
	smoothScroll?: (x: number, delta: number, smooth: number) => number;
	previousFactor?: number;
}
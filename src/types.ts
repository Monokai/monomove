export interface BezierLike {
	get(t: number): number;
	setIterations?(iter: number): void;
	setCacheSize?(size: number): void;
}

export type EasingFunction = (t: number) => number;

export type EasingType = string | EasingFunction | BezierLike;

export type TweenableObject = Record<string, number>;

export type ObjectUpdateCallback<T> = (object: T, value: number, delta: number) => void;
export type ScalarUpdateCallback = (value: number, progress: number, delta: number) => void;
export type UpdateCallback<T> = ObjectUpdateCallback<T> | ScalarUpdateCallback;
export type CompleteCallback<T> = (object: T, time: number) => void;
export type LoopCallback<T> = (object: T, loopCount: number) => void;
export type StartCallback<T> = (object: T) => void;
export type TimelineCallback<T> = (object: T) => void;

export interface ITween {
	start(): Promise<ITween>;
	stop(): ITween;
	update(time: number): boolean;
	startTime: number | null;
	delayTime: number;
	durationMS: number;
	totalTime?: number;
	delay(amount: number): ITween;
	setPosition(position: number): void;
	invalidate(): void;
	updateAllValues(delta?: number): void;
	value: number;
	easingFunction: EasingFunction;
}

// Public Data Payload
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
	centerOffset: number;
	originalTop: number;
	isVisible: boolean; // From IntersectionObserver
	data?: unknown; // User data
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

	// Callbacks
	onUpdate?: SmoothScrollCallback; // Runs every frame
	onScrolledIn?: (data: SmoothScrollCallbackData) => void;
	onScrolledOut?: (data: SmoothScrollCallbackData) => void;
	onScrolledInOnce?: (data: SmoothScrollCallbackData) => void;
	onScrolledOutOnce?: (data: SmoothScrollCallbackData) => void;
}

export interface BezierLike {
	get(t: number): number;
	cacheSize: number;
	iterations: number;
	precision: number;
	newtonRaphsonMinSlope: number;
	subdivisionPrecision: number;
	subdivisionIterations: number;
}

export type EasingFunction = (t: number) => number;

export type EasingType = string | EasingFunction | BezierLike;

export type TweenableObject = Record<string, number>;

export type ObjectOrValue<T> = T | number | null;

export type ScalarUpdateCallback = (value: number, progress: number, delta: number) => void;
export type ObjectUpdateCallback<T> = (object: T, progress: number, delta: number) => void;
export type UpdateCallback<T> = ObjectUpdateCallback<T> | ScalarUpdateCallback;
export type CompleteCallback<T> = (object: ObjectOrValue<T>) => void;
export type LoopCallback<T> = (object: ObjectOrValue<T>, loopCount: number) => void;
export type StartCallback<T> = (object: ObjectOrValue<T>) => void;
export type TimelineCallback<T> = (object: ObjectOrValue<T>) => void;

export interface EasingOptions {
	cacheSize?: number | null;
	iterations?: number | null;
	precision?: number | null;
	newtonRaphsonMinSlope?: number | null;
	subdivisionPrecision?: number | null;
	subdivisionIterations?: number | null;
}

export interface ITween {
	start(): Promise<ITween>;
	stop(): ITween;
	update(time: number): boolean;
	startTime: number | null;
	delayTime: number;
	durationMS: number;
	totalTime?: number;
	delay(amount: number): ITween;
	setProgress(progress: number, force?: boolean): void;
	invalidate(): void;
	updateAllValues(delta?: number): void;
	progress: number;
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
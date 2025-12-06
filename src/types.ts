// src/types.ts

export interface BezierLike {
	get(t: number): number;
	cacheSize?: number;
	iterations?: number;
	precision?: number;
	newtonRaphsonMinSlope?: number;
	subdivisionPrecision?: number;
	subdivisionIterations?: number;
}

export type EasingFunction = (t: number) => number;
export type EasingType = string | EasingFunction | BezierLike;

export type TweenableObject = Record<string, number>;
export type ObjectOrValue<T> = T | number | null;

// Callbacks
export type ScalarUpdateCallback = (value: number, progress: number, delta: number) => void;
export type ObjectUpdateCallback<T> = (object: T, progress: number, delta: number) => void;
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

// --- Internal / System Interface ---
// This is what TweenManager and Timeline expect to interact with.
export interface ITween {
	// Lifecycle & Control
	start(time?: number): Promise<any>;
	stop(): any;
	pause(): any;
	update(time: number): boolean;
	invalidate(): void;

	// Configuration
	delay(amount: number): any;
	setProgress(progress: number, force?: boolean): void;
	updateAllValues(delta?: number): void;

	// State Properties (Required by Timeline/Manager)
	readonly startTime: number | null;
	readonly delayTime: number;
	readonly durationMS: number;
	readonly totalTime?: number; // Timeline often checks this
	readonly progress: number;
	readonly easingFunction: EasingFunction;

	// Timeline specific hooks
	onTimelineInCallback: (() => void) | null;
	onTimelineOutCallback: (() => void) | null;
	onTimelineVisibleCallback: (() => void) | null;
	onTimelineInvisibleCallback: (() => void) | null;
	isTimelineVisible: boolean;
	isPreviousTimelineVisible: boolean;
}

// --- User Interfaces ---

// Base for chainable methods
export interface ITweenBase<Self> {
	start(time?: number): Promise<Self>;
	stop(): Self;
	pause(): Self;

	delay(amount: number): Self;
	duration(seconds: number): Self;
	easing(easing: EasingType, options?: EasingOptions): Self;

	// Lifecycle
	onStart(callback: (target: unknown) => void): Self;
	onComplete(callback: (target: unknown) => void): Self;
	loop(num?: number): Self;
	onLoop(callback: (target: unknown, loopCount: number) => void): Self;

	// Timeline
	onTimelineIn(callback: (target: unknown) => void): Self;
	onTimelineOut(callback: (target: unknown) => void): Self;
	onTimelineVisible(callback: (target: unknown) => void): Self;
	onTimelineInvisible(callback: (target: unknown) => void): Self;

	// Control
	rewind(): Self;
	restart(): Promise<Self>;
	setProgress(progress: number, force?: boolean): void;
	invalidate(): void;

	// Read-only state exposed to user
	readonly isPlaying: boolean;
	readonly progress: number;

	// Expose properties needed by ITween so these interfaces satisfy ITween
	readonly startTime: number | null;
	readonly delayTime: number;
	readonly durationMS: number;
	readonly totalTime?: number;
}

// 1. Strict Scalar API
export interface IScalarTween extends ITweenBase<IScalarTween> {
	from(value: number): IScalarTween;
	to(value: number, duration?: number): IScalarTween;
	onUpdate(callback: ScalarUpdateCallback): IScalarTween;

	onStart(callback: StartCallback<number>): IScalarTween;
	onComplete(callback: CompleteCallback<number>): IScalarTween;
}

// 2. Strict Object API
export interface IObjectTween<T> extends ITweenBase<IObjectTween<T>> {
	from(properties: Partial<T>): IObjectTween<T>;
	to(properties: Partial<T>, duration?: number): IObjectTween<T>;
	onUpdate(callback: ObjectUpdateCallback<T>): IObjectTween<T>;

	onStart(callback: StartCallback<T>): IObjectTween<T>;
	onComplete(callback: CompleteCallback<T>): IObjectTween<T>;
}

// Data Payload for SmoothScroll
export interface DOMRectLike {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface SmoothScrollCallbackData {
	item: HTMLElement;
	factor: number;
	rawFactor: number;
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
	isVisible: boolean;
	data?: unknown;
}

export type SmoothScrollCallback = (data: SmoothScrollCallbackData) => void;

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
	observeIn?: HTMLElement | null;
	directionOffset?: number;
	offset?: number;
	speed?: number;
	smoothing?: number;
	data?: unknown;
	onUpdate?: SmoothScrollCallback;
	onScrolledIn?: (data: SmoothScrollCallbackData) => void;
	onScrolledOut?: (data: SmoothScrollCallbackData) => void;
	onScrolledInOnce?: (data: SmoothScrollCallbackData) => void;
	onScrolledOutOnce?: (data: SmoothScrollCallbackData) => void;
}


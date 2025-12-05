interface BezierLike {
    get(t: number): number;
    cacheSize: number;
    iterations: number;
    precision: number;
    newtonRaphsonMinSlope: number;
    subdivisionPrecision: number;
    subdivisionIterations: number;
}
type EasingFunction = (t: number) => number;
type EasingType = string | EasingFunction | BezierLike;
type TweenableObject = Record<string, number>;
type ObjectOrValue<T> = T | number | null;
type ScalarUpdateCallback = (value: number, progress: number, delta: number) => void;
type ObjectUpdateCallback<T> = (object: T, progress: number, delta: number) => void;
type UpdateCallback<T> = ObjectUpdateCallback<T> | ScalarUpdateCallback;
type CompleteCallback<T> = (object: ObjectOrValue<T>) => void;
type LoopCallback<T> = (object: ObjectOrValue<T>, loopCount: number) => void;
type StartCallback<T> = (object: ObjectOrValue<T>) => void;
type TimelineCallback<T> = (object: ObjectOrValue<T>) => void;
interface EasingOptions {
    cacheSize?: number | null;
    iterations?: number | null;
    precision?: number | null;
    newtonRaphsonMinSlope?: number | null;
    subdivisionPrecision?: number | null;
    subdivisionIterations?: number | null;
}
interface ITween {
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
    progress: number;
    easingFunction: EasingFunction;
}
interface SmoothScrollCallbackData {
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
type SmoothScrollCallback = (data: SmoothScrollCallbackData) => void;
interface DOMRectLike {
    left: number;
    top: number;
    width: number;
    height: number;
}
interface SmoothScrollOptions {
    container?: HTMLElement;
    content?: HTMLElement;
    easing?: EasingFunction;
    scrollDuration?: number;
    listener?: Window | HTMLElement;
    debug?: boolean;
    onResize?: () => void;
}
interface ScrollItemOptions {
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

declare class Tween<T extends TweenableObject = TweenableObject> implements ITween {
    durationMS: number;
    isPlaying: boolean;
    delayTime: number;
    startTime: number | null;
    easingFunction: EasingFunction;
    progress: number;
    onTimelineInCallback: (() => void) | null;
    onTimelineOutCallback: (() => void) | null;
    onTimelineVisibleCallback: (() => void) | null;
    onTimelineInvisibleCallback: (() => void) | null;
    isTimelineIn: boolean;
    isPreviousTimelineIn: boolean;
    isTimelineVisible: boolean;
    isPreviousTimelineVisible: boolean;
    private _objectOrValue;
    private _onUpdateCallback;
    private _onLoopCallback;
    private _onCompleteCallback;
    private _onStartCallback;
    private _valuesEnd;
    private _valuesStart;
    private _propKeys;
    private _propStartValues;
    private _propChangeValues;
    private _loopNum;
    private _loopCount;
    private _onStartCallbackFired;
    private _previousTime;
    private _elapsed;
    private _previousUpdateValue;
    private _inverseDuration;
    private _targetIsFunction;
    private _isInitialized;
    constructor(object: T, duration?: number);
    constructor(callback: ScalarUpdateCallback, duration?: number);
    from(properties: Partial<T>): this;
    to(properties: Partial<T>, duration?: number): this;
    duration(duration: number): this;
    rewind(): this;
    restart(): Promise<this>;
    loop(num?: number): this;
    setLoopCallback(callback: LoopCallback<T>): this;
    private _init;
    startTween(time?: number): this;
    start(time?: number): Promise<this>;
    stop(): this;
    delay(amount: number): this;
    easing(_easing?: EasingType, easingOptions?: EasingOptions): this;
    onStart(callback: StartCallback<T>): this;
    onUpdate(callback: UpdateCallback<T>): this;
    onComplete(callback: CompleteCallback<T>): this;
    onTimelineIn(callback: TimelineCallback<T>): this;
    onTimelineOut(callback: TimelineCallback<T>): this;
    onTimelineVisible(callback: TimelineCallback<T>): this;
    onTimelineInvisible(callback: TimelineCallback<T>): this;
    setPosition(position: number): void;
    updateAllValues(delta?: number): void;
    invalidate(): this;
    update(time: number): boolean;
}

interface TimelineOptions {
    delay?: number;
}
declare class Timeline {
    previousPosition: number;
    startTime: number | null;
    delayTime: number;
    durationMS: number;
    progress: number;
    easingFunction: (t: number) => number;
    totalTime: number;
    protected _driverTween: Tween | null;
    protected _tweens: ITween[];
    protected _loopNum: number;
    private _startTimes;
    private _durations;
    private _cursor;
    constructor({ delay }?: TimelineOptions);
    protected static setTweenIn(tween: Tween, isIn: boolean): void;
    protected static setTweenVisibility(tween: Tween, isVisible: boolean): void;
    delay(amount: number): this;
    loop(num?: number): this;
    stop(): this;
    destroy(): void;
    add(tween: ITween, offset?: number): this;
    at(time: number, tween: ITween): this;
    private _register;
    start(): Promise<this>;
    setPosition(position: number): void;
    update(): boolean;
}

declare class SmoothScroller {
    isDown: boolean;
    isLocked: boolean;
    scroll: number;
    scrollWidth: number;
    scrollHeight: number;
    private _pixelRatio;
    private _scrollThreshold;
    private _targetScroll;
    private _previousScroll;
    private _viewportHeight;
    private _items;
    private _activeItems;
    private _smoothItems;
    private _debugCanvas;
    private _debugContext;
    private _isAnimating;
    private _previousScrollWidth;
    private _previousScrollHeight;
    private _isFirstScrollInstant;
    private _isTouch;
    private _scrollTween;
    private _touchScrollDuration;
    private _scrollDuration;
    private _container;
    private _content;
    private _listener;
    private _debug;
    private _onResizeFunk;
    private _totalTickTime;
    private _scrollFrom;
    private _easing;
    private _getScrollPosition;
    private _onTickFunk;
    private _onTouchStart;
    private _onMouseDown;
    private _onWheel;
    private _onScroll;
    constructor({ container, content, easing, scrollDuration, listener, debug, onResize }?: SmoothScrollOptions);
    private _setupListeners;
    private _setupDebug;
    private _onTick;
    private _updateAll;
    draw(): void;
    drawAll(): void;
    getScrollPosition(): number;
    resize(): void;
    triggerAnimations(all?: boolean): void;
    private _drawDebug;
    add(items: HTMLElement | HTMLElement[], options: ScrollItemOptions): void;
    add(items: HTMLElement | HTMLElement[], callback: SmoothScrollCallback, options?: ScrollItemOptions): void;
    private _refreshActiveSets;
    remove(_items: HTMLElement | HTMLElement[]): void;
    static getBox(node: HTMLElement): DOMRectLike;
    scrollTo(position?: number, time?: number | null): Promise<Tween<{
        y: number;
    }>>;
    scrollToElement(node: HTMLElement, offset?: number, time?: number | null): Promise<Tween<{
        y: number;
    }>>;
    reset(): void;
    stop(): void;
    lock(): void;
    unlock(): void;
    setContent(content: HTMLElement): void;
    unsetContent(): void;
    setScrollDuration(value: number): void;
    setTouchScrollDuration(value: number): void;
    destroy(): void;
}

declare class CubicBezier implements BezierLike {
    iterations: number;
    precision: number;
    newtonRaphsonMinSlope: number;
    subdivisionPrecision: number;
    subdivisionIterations: number;
    private _cacheSize;
    private _cachedValueStepSize;
    private _cachedValues;
    private _x1;
    private _y1;
    private _x2;
    private _y2;
    private _isPreComputed;
    private static _calculate;
    private static _getSlope;
    constructor(x1: number | string, y1?: number, x2?: number, y2?: number);
    private _binarySubdivide;
    private _newtonRaphson;
    private _preCompute;
    private _getT;
    get(x: number): number;
    set cacheSize(x: number);
    get cacheSize(): number;
}

declare class TweenManager {
    private static _tweens;
    private static _easingCache;
    private static _isUpdating;
    static bezierIterations: number | null;
    static bezierCacheSize: number | null;
    static bezierPrecision: number | null;
    static bezierNewtonRaphsonMinSlope: number | null;
    static bezierSubdivisionPrecision: number | null;
    static bezierSubdivisionIterations: number | null;
    static getAll(): ITween[];
    static removeAll(): void;
    static add(tween: ITween): void;
    static remove(tween: ITween): void;
    static onTick(time: number): boolean;
    static getEasingFromCache(key: string): CubicBezier;
    static setEasingOptions(bezier: CubicBezier | BezierLike, easingOptions?: EasingOptions): void;
}

type RenderCallback = (ms: number) => boolean | void;
declare class RenderLoop {
    private static _subscribers;
    private static _isUpdating;
    private static _activeCount;
    private static _ms;
    private static _time;
    private static _previousTime;
    private static _pauseTime;
    private static _pauseTimeStart;
    private static _isAnimating;
    private static _requestAnimation;
    private static _requestID;
    private static _isFirstTime;
    private static _loopHandler;
    private static _animate;
    private static _compact;
    static stop(callback?: () => void): void;
    static add(callback: RenderCallback): void;
    static reset(): void;
    static remove(callback: RenderCallback): void;
    static trigger(): void;
    static getTime(): number;
    static pause(): void;
    static play(): void;
    static triggerAnimation(): void;
    static isPlaying(): boolean;
}

/**
 * @license
 * Monomove - utilities for moving things
 *
 * Copyright © 2021-2025 Monokai (monokai.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

declare function animate<T extends TweenableObject>(target: T, to: Partial<T>, duration?: number, easing?: EasingType): Promise<Tween<T>>;
declare function timeline(options?: {
    delay?: number;
}): Timeline;
declare const delay: (seconds: number) => Promise<Tween<{}>>;
declare function smoothScroll(items: HTMLElement | HTMLElement[], callback: SmoothScrollCallback, options?: ScrollItemOptions, scrollerOptions?: SmoothScrollOptions): SmoothScroller;

export { CubicBezier, RenderLoop, SmoothScroller, Timeline, Tween, TweenManager, animate, delay, smoothScroll, timeline };
export type { BezierLike, CompleteCallback, DOMRectLike, EasingFunction, EasingOptions, EasingType, ITween, LoopCallback, ObjectOrValue, ObjectUpdateCallback, ScalarUpdateCallback, ScrollItemOptions, SmoothScrollCallback, SmoothScrollCallbackData, SmoothScrollOptions, StartCallback, TimelineCallback, TweenableObject, UpdateCallback };

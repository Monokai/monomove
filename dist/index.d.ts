interface BezierLike {
    get(t: number): number;
    cacheSize?: number;
    iterations?: number;
    precision?: number;
    newtonRaphsonMinSlope?: number;
    subdivisionPrecision?: number;
    subdivisionIterations?: number;
}
type EasingFunction = (t: number) => number;
type EasingType = string | EasingFunction | BezierLike;
type TweenableObject = Record<string, number>;
type ObjectOrValue<T> = T | number | null;
type ScalarUpdateCallback = (value: number, progress: number, delta: number) => void;
type ObjectUpdateCallback<T> = (object: T, progress: number, delta: number) => void;
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
    start(time?: number): Promise<any>;
    stop(): any;
    pause(): any;
    update(time: number): boolean;
    invalidate(): void;
    delay(amount: number): any;
    setProgress(progress: number, force?: boolean): void;
    updateAllValues(delta?: number): void;
    readonly startTime: number | null;
    readonly delayTime: number;
    readonly durationMS: number;
    readonly totalTime?: number;
    readonly progress: number;
    readonly easingFunction: EasingFunction;
    onTimelineInCallback: (() => void) | null;
    onTimelineOutCallback: (() => void) | null;
    onTimelineVisibleCallback: (() => void) | null;
    onTimelineInvisibleCallback: (() => void) | null;
    isTimelineVisible: boolean;
    isPreviousTimelineVisible: boolean;
}
interface ITweenBase<Self> {
    start(time?: number): Promise<Self>;
    stop(): Self;
    pause(): Self;
    delay(amount: number): Self;
    duration(seconds: number): Self;
    easing(easing: EasingType, options?: EasingOptions): Self;
    onStart(callback: (target: unknown) => void): Self;
    onComplete(callback: (target: unknown) => void): Self;
    loop(num?: number): Self;
    onLoop(callback: (target: unknown, loopCount: number) => void): Self;
    onTimelineIn(callback: (target: unknown) => void): Self;
    onTimelineOut(callback: (target: unknown) => void): Self;
    onTimelineVisible(callback: (target: unknown) => void): Self;
    onTimelineInvisible(callback: (target: unknown) => void): Self;
    rewind(): Self;
    restart(): Promise<Self>;
    setProgress(progress: number, force?: boolean): void;
    invalidate(): void;
    readonly isPlaying: boolean;
    readonly progress: number;
    readonly startTime: number | null;
    readonly delayTime: number;
    readonly durationMS: number;
    readonly totalTime?: number;
}
interface IScalarTween extends ITweenBase<IScalarTween> {
    from(value: number): IScalarTween;
    to(value: number, duration?: number): IScalarTween;
    onUpdate(callback: ScalarUpdateCallback): IScalarTween;
    onStart(callback: StartCallback<number>): IScalarTween;
    onComplete(callback: CompleteCallback<number>): IScalarTween;
}
interface IObjectTween<T> extends ITweenBase<IObjectTween<T>> {
    from(properties: Partial<T>): IObjectTween<T>;
    to(properties: Partial<T>, duration?: number): IObjectTween<T>;
    onUpdate(callback: ObjectUpdateCallback<T>): IObjectTween<T>;
    onStart(callback: StartCallback<T>): IObjectTween<T>;
    onComplete(callback: CompleteCallback<T>): IObjectTween<T>;
}
interface DOMRectLike {
    left: number;
    top: number;
    width: number;
    height: number;
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
    totalTime?: number;
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
    private _startValuesCalculated;
    constructor();
    constructor(object: T, duration?: number);
    constructor(callback: ScalarUpdateCallback, duration?: number);
    constructor(objectOrCallback: T | ScalarUpdateCallback, duration?: number);
    from(properties: Partial<T> | number): this;
    to(properties: Partial<T> | number, duration?: number): this;
    duration(duration: number): this;
    rewind(): this;
    restart(): Promise<this>;
    loop(num?: number): this;
    onLoop(callback: LoopCallback<T>): this;
    delay(amount: number): this;
    easing(_easing?: EasingType, easingOptions?: EasingOptions): this;
    onUpdate(callback: ObjectUpdateCallback<T> | ScalarUpdateCallback): this;
    onStart(callback: StartCallback<T>): this;
    onComplete(callback: CompleteCallback<T>): this;
    onTimelineIn(callback: TimelineCallback<T>): this;
    onTimelineOut(callback: TimelineCallback<T>): this;
    onTimelineVisible(callback: TimelineCallback<T>): this;
    onTimelineInvisible(callback: TimelineCallback<T>): this;
    start(time?: number): Promise<this>;
    startTween(time?: number): this;
    stop(): this;
    pause(): this;
    private _calculateStartValues;
    updateAllValues(delta?: number): void;
    setProgress(progress: number, force?: boolean): void;
    invalidate(): void;
    update(time: number): boolean;
}

interface TimelineOptions {
    delay?: number;
    onComplete?: () => void;
    onLoop?: () => void;
}
declare class Timeline {
    time: number;
    totalTime: number;
    isPlaying: boolean;
    private _items;
    private _delayTime;
    private _loopCount;
    private _onComplete;
    private _onLoop;
    private _isDirty;
    private _driver;
    private _easing;
    private _timeScale;
    constructor({ delay, onComplete, onLoop }?: TimelineOptions);
    add(tween: ITween, offset?: number): this;
    at(seconds: number, tween: ITween): this;
    private _register;
    delay(seconds: number): this;
    loop(count?: number): this;
    easing(easing: EasingType): this;
    timeScale(scale: number): this;
    start(): Promise<this>;
    pause(): this;
    stop(): this;
    setPosition(position: number, force?: boolean): void;
    setProgress(progress: number): void;
    private _sort;
    private _updateChildren;
    protected static setTweenVisibility(tween: ITween, isVisible: boolean): void;
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

declare function tween(target: ScalarUpdateCallback, duration?: number): IScalarTween;
declare function tween<T extends TweenableObject>(target: T, duration?: number): IObjectTween<T>;
declare function tween(): IScalarTween;
declare function animate<T extends TweenableObject>(target: T, to: Partial<T>, duration?: number, easing?: EasingType): Promise<IObjectTween<T>>;
declare function timeline(options?: {
    delay?: number;
}): Timeline;
declare const delay: (seconds: number) => Promise<IScalarTween>;
declare function smoothScroll(items: HTMLElement | HTMLElement[], callback: SmoothScrollCallback, options?: ScrollItemOptions, scrollerOptions?: SmoothScrollOptions): SmoothScroller;

export { CubicBezier, RenderLoop, SmoothScroller, Timeline, Tween, TweenManager, animate, delay, smoothScroll, timeline, tween };
export type { BezierLike, CompleteCallback, DOMRectLike, EasingFunction, EasingOptions, EasingType, IObjectTween, IScalarTween, ITween, ITweenBase, LoopCallback, ObjectOrValue, ObjectUpdateCallback, ScalarUpdateCallback, ScrollItemOptions, SmoothScrollCallback, SmoothScrollCallbackData, SmoothScrollOptions, StartCallback, TimelineCallback, TweenableObject };

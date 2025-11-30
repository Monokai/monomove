interface BezierLike {
    get(t: number): number;
    setIterations?(iter: number): void;
    setCacheSize?(size: number): void;
}
type EasingFunction = (t: number) => number;
type EasingType = string | EasingFunction | BezierLike;
interface TweenableObject {
    [key: string]: number;
}
type UpdateCallback<T> = (object: T, value: number, delta: number) => void;
type CompleteCallback<T> = (object: T, time: number) => void;
type LoopCallback<T> = (object: T, loopCount: number) => void;
type StartCallback<T> = (object: T) => void;
type TimelineCallback<T> = (object: T) => void;
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
    value: number;
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
    fixedTop?: number;
    isScrolledIn?: boolean;
    isScrolledOut?: boolean;
    isScrolledInOnce?: boolean;
    isScrolledOutOnce?: boolean;
    previousIsInView?: boolean;
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
    scrollFactor?: number | null;
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
}
interface ScrollAnimationEntry {
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

interface EasingOptions {
    iterations?: number;
    cacheSize?: number;
}
declare class Tween$1<T extends TweenableObject = TweenableObject> implements ITween {
    durationMS: number;
    isPlaying: boolean;
    delayTime: number;
    startTime: number | null;
    easingFunction: EasingFunction;
    object: T;
    value: number;
    onTimelineInCallback: TimelineCallback<T> | null;
    onTimelineOutCallback: TimelineCallback<T> | null;
    onTimelineVisibleCallback: TimelineCallback<T> | null;
    onTimelineInvisibleCallback: TimelineCallback<T> | null;
    timelineIn: boolean;
    previousTimelineIn: boolean;
    timelineVisible: boolean;
    previousTimelineVisible: boolean;
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
    constructor(object?: T | UpdateCallback<T>, duration?: number);
    from(properties: Partial<T>): this;
    to(properties: Partial<T>, duration?: number): this;
    duration(duration: number): this;
    rewind(): this;
    restart(): Promise<this>;
    loop(num?: number): this;
    setLoopCallback(callback: LoopCallback<T>): this;
    startTween(time?: number): this;
    start(time?: number): Promise<this>;
    stop(): this;
    delay(amount: number): this;
    easing(_easing?: EasingType, { iterations, cacheSize }?: EasingOptions): this;
    onStart(callback: StartCallback<T>): this;
    onUpdate(callback: UpdateCallback<T>): this;
    onComplete(callback?: CompleteCallback<T> | null): this;
    onTimelineIn(callback: TimelineCallback<T>): this;
    onTimelineOut(callback: TimelineCallback<T>): this;
    onTimelineVisible(callback: TimelineCallback<T>): this;
    onTimelineInvisible(callback: TimelineCallback<T>): this;
    setPosition(position: number): void;
    updateAllValues(delta?: number): void;
    invalidate(): this;
    update(time: number): boolean;
}

declare class CubicBezier {
    #private;
    constructor(x1: number | string, y1?: number, x2?: number, y2?: number);
    get(x: number): number;
    setIterations(x: number): void;
    setCacheSize(x: number): void;
}

declare class TweenManager {
    private static _tweens;
    private static _time;
    private static _easingCache;
    private static _isUpdating;
    static bezierIterations: number | null;
    static bezierCacheSize: number | null;
    static getAll(): ITween[];
    static removeAll(): void;
    static add(tween: ITween): void;
    static remove(tween: ITween): void;
    static onlyHasDelayedTweens(time: number): boolean;
    static onTick(time: number): boolean;
    static setBezierIterations(x: number): void;
    static setBezierCacheSize(x: number): void;
    static getEasingFromCache(key: string): CubicBezier;
}

interface TimelineOptions {
    delay?: number;
}
interface TimelineValue {
    value: number;
    [key: string]: number;
}
declare abstract class AbstractTimeline implements ITween {
    previousPosition: number;
    startTime: number | null;
    delayTime: number;
    durationMS: number;
    value: number;
    easingFunction: (t: number) => number;
    protected _driverTween: Tween$1<TimelineValue> | null;
    protected _tweens: ITween[];
    totalTime: number;
    constructor({ delay }?: TimelineOptions);
    protected static setTweenIn(tween: Tween$1, isIn: boolean): void;
    protected static setTweenVisibility(tween: Tween$1, isVisible: boolean): void;
    delay(amount: number): this;
    stop(): this;
    destroy(): void;
    start(): Promise<this>;
    abstract setPosition(position: number): void;
    abstract update(time: number): boolean;
    updateAllValues(): void;
    invalidate(): void;
}

declare class TweenChain extends AbstractTimeline {
    private _startTimes;
    private _durations;
    constructor(tweens: ITween[], options?: TimelineOptions);
    private _addTweens;
    setPosition(position: number): void;
    update(time?: number): boolean;
}

declare class Timeline extends AbstractTimeline {
    private _startTimes;
    private _durations;
    constructor(tweens: ITween[], options?: TimelineOptions);
    private _addTweens;
    setPosition(position: number): void;
    update(time?: number): boolean;
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
    private _animations;
    private _activeAnimations;
    private _smoothAnimations;
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
    private _getScrollFn;
    private _tickHandler;
    private _touchStartHandler;
    private _mouseDownHandler;
    private _wheelHandler;
    private _scrollHandler;
    constructor({ container, content, easing, scrollFactor, scrollDuration, listener, debug, onResize }?: SmoothScrollOptions);
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
    private _triggerAnimation;
    add(_items: HTMLElement | HTMLElement[], callback: SmoothScrollCallback, options?: ScrollItemOptions): void;
    private _refreshActiveSets;
    remove(_items: HTMLElement | HTMLElement[]): void;
    static getBox(node: HTMLElement): DOMRectLike;
    private _initBox;
    scrollTo(position?: number, time?: number | null): Promise<Tween$1<{
        y: number;
    }>>;
    scrollToElement(node: HTMLElement, offset?: number, time?: number | null): Promise<Tween$1<{
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

type RenderCallback = (ms: number) => boolean | void;
type CleanupCallback = () => void;
declare class RenderLoop {
    private static _subscribers;
    private static _cleanups;
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
    private static _onlyHasDelayedTweens;
    private static _isFirstTime;
    private static _loopHandler;
    private static _animate;
    private static _compact;
    static stop(callback?: () => void): void;
    static add(callback: RenderCallback, cleanUp?: CleanupCallback): void;
    static reset(): void;
    static remove(callback: RenderCallback): void;
    static trigger(): void;
    static getTime(): number;
    static pause(): void;
    static play(): void;
    static triggerAnimation(): void;
    static isPlaying(): boolean;
}

declare const Tween: typeof Tween$1;
declare const delay: (x: number) => Promise<Tween$1<TweenableObject>>;

export { CubicBezier, RenderLoop, SmoothScroller, Timeline, Tween, TweenChain, TweenManager, delay };
export type { BezierLike, CompleteCallback, DOMRectLike, EasingFunction, EasingType, ITween, LoopCallback, ScrollAnimationEntry, ScrollItemOptions, SmoothScrollCallback, SmoothScrollCallbackData, SmoothScrollOptions, StartCallback, TimelineCallback, TweenableObject, UpdateCallback };

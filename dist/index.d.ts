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
    #private;
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
    #private;
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
    tween: Tween$1<TimelineValue> | null;
    tweens: (ITween)[];
    totalTime: number;
    constructor({ delay }?: TimelineOptions);
    static setTweenIn(tween: Tween$1, isIn: boolean): void;
    static setTweenVisibility(tween: Tween$1, isVisible: boolean): void;
    delay(amount: number): this;
    stop(): this;
    destroy(): void;
    start(): Promise<ITween>;
    abstract setPosition(position: number): void;
    abstract update(time: number): boolean;
    updateAllValues(): void;
    invalidate(): void;
}

declare class TweenChain extends AbstractTimeline {
    #private;
    constructor(tweens: (ITween)[], options?: TimelineOptions);
    setPosition(position: number): void;
    update(time?: number): boolean;
}

declare class Timeline extends AbstractTimeline {
    #private;
    constructor(tweens: ITween[], options?: TimelineOptions);
    setPosition(position: number): void;
    update(time?: number): boolean;
}

declare class SmoothScroller {
    #private;
    isDown: boolean;
    isLocked: boolean;
    scroll: number;
    scrollWidth: number;
    scrollHeight: number;
    constructor({ container, content, easing, scrollFactor, scrollDuration, listener, debug, onResize }?: SmoothScrollOptions);
    draw(): void;
    drawAll(): void;
    getScrollPosition(): unknown;
    resize(): void;
    triggerAnimations(all?: boolean): void;
    add(_items: HTMLElement | HTMLElement[], callback: SmoothScrollCallback, options?: ScrollItemOptions): void;
    remove(_items: HTMLElement | HTMLElement[]): void;
    static getBox(node: HTMLElement): DOMRectLike;
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

declare class RenderLoop {
    #private;
    static stop(callback?: () => void): void;
    static add(context: unknown, funk: (ms: number) => boolean | void, cleanUp?: () => void): void;
    static reset(): void;
    static remove(context: unknown, funk?: (ms: number) => boolean | void): void;
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

interface BezierLike {
    get(t: number): number;
    setIterations?(iter: number): void;
    setCacheSize?(size: number): void;
}
type EasingFunction = (t: number) => number;
type EasingType = string | EasingFunction | BezierLike;
type TweenableObject = Record<string, number>;
type ObjectUpdateCallback<T> = (object: T, value: number, delta: number) => void;
type ScalarUpdateCallback = (value: number, progress: number, delta: number) => void;
type UpdateCallback<T> = ObjectUpdateCallback<T> | ScalarUpdateCallback;
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
declare class Tween<T extends TweenableObject = TweenableObject> implements ITween {
    durationMS: number;
    isPlaying: boolean;
    delayTime: number;
    startTime: number | null;
    easingFunction: EasingFunction;
    object: T | null;
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
    private _targetIsFunction;
    /**
     * Create a tween that animates properties of an object.
     */
    constructor(object: T, duration?: number);
    /**
     * Create a tween that calls a function with a scalar value from 0 to 1.
     */
    constructor(callback: ScalarUpdateCallback, duration?: number);
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

interface TimelineOptions {
    delay?: number;
}
declare abstract class AbstractTimeline implements ITween {
    previousPosition: number;
    startTime: number | null;
    delayTime: number;
    durationMS: number;
    value: number;
    easingFunction: (t: number) => number;
    protected _driverTween: Tween | null;
    protected _tweens: ITween[];
    protected _loopNum: number;
    totalTime: number;
    constructor({ delay }?: TimelineOptions);
    protected static setTweenIn(tween: Tween, isIn: boolean): void;
    protected static setTweenVisibility(tween: Tween, isVisible: boolean): void;
    delay(amount: number): this;
    loop(num?: number): this;
    stop(): this;
    destroy(): void;
    start(): Promise<this>;
    abstract setPosition(position: number): void;
    abstract update(time: number): boolean;
    updateAllValues(): void;
    invalidate(): void;
}

declare class Timeline extends AbstractTimeline {
    private _startTimes;
    private _durations;
    private _cursor;
    constructor(options?: TimelineOptions);
    /**
     * Adds a tween to the end of the timeline (sequentially).
     * @param tween The tween or timeline to add
     * @param offset Optional offset in seconds relative to the current end of the timeline.
     *               (e.g., -0.5 starts 0.5s before the previous tween ends).
     */
    add(tween: ITween, offset?: number): this;
    /**
     * Inserts a tween at a specific absolute time.
     * @param time The absolute time in seconds to start the tween.
     * @param tween The tween to insert.
     */
    at(time: number, tween: ITween): this;
    /**
     * Internal registration logic
     */
    private _register;
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

/**
 * @deprecated TweenChain is deprecated. Please use Timeline instead.
 * This class maps the old array-based constructor to the new Timeline.add API.
 */
declare class TweenChain extends Timeline {
    constructor(tweens: ITween[], options?: {
        delay?: number;
    });
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

/**
 * Animate an object's properties to specific values.
 *
 * @example
 * animate(element.style, { opacity: 1, top: 100 }, 1.5, 'easeOut');
 */
declare function animate<T extends TweenableObject>(target: T, to: Partial<T>, duration?: number, easing?: EasingType): Promise<Tween<T>>;
/**
 * Create a new timeline sequence.
 *
 * @example
 * const tl = timeline({ delay: 0.5 })
 *   .add(tween1)
 *   .add(tween2, -0.2); // overlap
 * tl.start();
 */
declare function timeline(options?: {
    delay?: number;
}): Timeline;
/**
 * Creates a delay promise.
 */
declare const delay: (seconds: number) => Promise<Tween<{}>>;
/**
 * Helper to create a SmoothScroller instance with default settings.
 */
declare function smoothScroll(items: HTMLElement | HTMLElement[], callback: SmoothScrollCallback, options?: ScrollItemOptions, scrollerOptions?: SmoothScrollOptions): SmoothScroller;

export { CubicBezier, RenderLoop, SmoothScroller, Timeline, Tween, TweenChain, TweenManager, animate, delay, smoothScroll, timeline };
export type { BezierLike, CompleteCallback, DOMRectLike, EasingFunction, EasingType, ITween, LoopCallback, ObjectUpdateCallback, ScalarUpdateCallback, ScrollAnimationEntry, ScrollItemOptions, SmoothScrollCallback, SmoothScrollCallbackData, SmoothScrollOptions, StartCallback, TimelineCallback, TweenableObject, UpdateCallback };

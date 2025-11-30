import Tween from './Tween.js';
import type { ITween } from '../types.js';

export interface TimelineOptions {
    delay?: number;
}

// Internal interface for the driver tween
interface TimelineValue {
    value: number;
    [key: string]: number;
}

export default abstract class AbstractTimeline implements ITween {

    public previousPosition: number;
    
    // ITween interface properties
    public startTime: number | null = null;
    public delayTime: number = 0;
    public durationMS: number = 0;
    public value: number = 0;
    public easingFunction: (t: number) => number = k => k;
    
    // Internal
    protected _driverTween: Tween<TimelineValue> | null = null;
    protected _tweens: ITween[] = [];
    public totalTime: number = 0;

    constructor({
        delay = 0
    }: TimelineOptions = {}) {
        this.previousPosition = 0;
        this.delayTime = delay * 1000;
    }

    // Static helpers to bridge Tween callbacks without exposing internal logic publicly
    protected static setTweenIn(tween: Tween, isIn: boolean) {
        tween.timelineIn = isIn;

        if (tween.timelineIn !== tween.previousTimelineIn) {
            if (isIn && tween.onTimelineInCallback) {
                tween.onTimelineInCallback(tween.object);
            } else if (!isIn && tween.onTimelineOutCallback) {
                tween.onTimelineOutCallback(tween.object);
            }

            tween.previousTimelineIn = tween.timelineIn;
        }
    }

    protected static setTweenVisibility(tween: Tween, isVisible: boolean) {
        tween.timelineVisible = isVisible;

        if (tween.timelineVisible !== tween.previousTimelineVisible) {
            if (isVisible && tween.onTimelineVisibleCallback) {
                tween.onTimelineVisibleCallback(tween.object);
            } else if (!isVisible && tween.onTimelineInvisibleCallback) {
                tween.onTimelineInvisibleCallback(tween.object);
            }

            tween.previousTimelineVisible = tween.timelineVisible;
        }
    }

    // ITween method implementation
    public delay(amount: number): this {
        this.delayTime = amount * 1000;
        return this;
    }

    public stop() {
        this._driverTween?.stop();
        return this;
    }

    public destroy() {
        this.stop();

        // Stop all children
        for (let i = 0; i < this._tweens.length; i++) {
            this._tweens[i].stop();
        }
        
        this._tweens.length = 0;
        this.totalTime = 0;
    }

    public start(): Promise<this> {
        // Create a driver tween that goes from 0 to 1 over totalTime
        // We use the Tween class to handle the timing loop and easing
        this._driverTween = new Tween<TimelineValue>({ value: 0 }, this.totalTime / 1000);
        
        // Pass the delay to the driver
        this._driverTween.delay(this.delayTime / 1000);
        
        this._driverTween.onUpdate(({ value }) => {
            this.setPosition(value);
        });

        // We return the promise of the driver, but chained to return 'this' timeline
        return this._driverTween.start().then(() => this);
    }

    // Abstract methods that must be implemented by subclasses
    public abstract setPosition(position: number): void;
    public abstract update(time: number): boolean;

    // Stub for ITween compliance (Timelines calculate child values directly in setPosition)
    public updateAllValues() {}
    public invalidate() {}
}
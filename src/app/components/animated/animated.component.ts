import { Component, EventEmitter } from '@angular/core';
import { Point } from '../../core/point';
import { assertTrue } from '../../models/util';
import { TileObject } from '../../scene/tile-object';

export interface IAnimationConfig {
  /**
   * It may seem weird to require name, but it's to enforce
   * a human-readable naming scheme for debugging win.
   */
  name: string;
  /** The entire duration of this animation */
  duration: number;
  /** Optional number of times to the repeat frames during the duration of the animation. */
  repeats?: number;
  /** Optional frames to interpolate between (will use all frames if none are specified) */
  frames?: any[];
  /** Move translation */
  move?: Point;
  /** The object that's animating */
  host: TileObject;
  /** callback that happens after this animation task is complete */
  callback?: (config: IAnimationConfig) => void;
  /** async function that returns once all data needed for the animation is loaded */
  preload?: (config: IAnimationConfig) => Promise<void>;
}

export interface IAnimationTask extends IAnimationConfig {
  elapsed: number;
  start?: any; // starting value
  target?: any; // target value
  value: any; // current value
  complete?: boolean;
  startFrame: number; // The starting frame to restore when the animation is complete.
  done?: (config: IAnimationConfig) => void;
}

export interface IAnimatedBehaviorStopped {
  task: IAnimationTask;
  component: AnimatedComponent;
}

// Implementation
// -------------------------------------------------------------------------
@Component({
  selector: 'animated',
  template: '<ng-content></ng-content>',
})
export class AnimatedComponent extends TileObject {
  onStop$ = new EventEmitter<IAnimatedBehaviorStopped>();

  private _tasks: IAnimationTask[] = [];
  private _animationKeys: IAnimationConfig[] = [];
  private _currentAnimation: IAnimationTask | null = null;

  constructor() {
    super();
  }

  async play(config: IAnimationConfig) {
    const task: IAnimationTask = config as any;
    task.elapsed = 0;
    if (task.move) {
      task.startFrame = task.host.frame;
      task.start = new Point(task.host.point);
      task.target = new Point(task.host.point).add(task.move);
      task.value = new Point(task.host.point);
    }

    return new Promise<void>((resolve) => {
      const realCallback = task.callback;
      task.callback = (config: IAnimationConfig) => {
        if (realCallback) {
          realCallback(config);
        }
        resolve();
      };
      this._tasks.push(task);
    });
  }

  removeCompleteTasks() {
    for (let i = 0; i < this._tasks.length; i++) {
      const task: IAnimationTask = this._tasks[i];
      if (task.complete === true) {
        this._tasks.splice(i, 1);
        if (task.done) {
          task.done(task);
        }
        if (task.callback) {
          task.callback(task);
        }
        this.onStop$.emit({
          task,
          component: this,
        });
        i--;
      }
    }
  }

  interpolateTick(elapsed: number) {
    super.interpolateTick(elapsed);
    this.update(elapsed);
    this.removeCompleteTasks();
  }

  update(elapsed: number) {
    if (this._tasks.length === 0) {
      return;
    }
    // Interp each task and fire events where necessary.
    for (let i = 0; i < this._tasks.length; i++) {
      const task: IAnimationTask = this._tasks[i];
      if (task.elapsed >= task.duration) {
        task.complete = true;
        task.elapsed = task.duration;
      }
      if (task.duration > 0) {
        const factor: number = task.elapsed / task.duration;
        // Interp point
        // console.log("Interp from " + task.start + " to " + task.target );
        if (task.move && task.move instanceof Point) {
          const interpolated: Point = task.value.interpolate(
            task.start,
            task.target,
            factor
          );
          task.host.point.x = interpolated.x;
          task.host.point.y = interpolated.y;
        }
        if (task.frames && task.frames.length) {
          const index = Math.round(this.interpolate(0, task.frames.length - 1, factor));
          const frame = task.frames[index];
          // console.log("Interp frame = " + frame);
          task.host.frame = frame;
        }
      }
      if (!task.complete) {
        task.elapsed += elapsed;
      }
    }
  }

  interpolate(from: number, to: number, factor: number): number {
    factor = Math.min(Math.max(factor, 0), 1);
    return from * (1.0 - factor) + to * factor;
  }

  async playChain(animations: IAnimationConfig[]) {
    await this.preload(animations);
    await new Promise<void>((resolve) => {
      // TODO: Need a map of these for multiple animations on the same component.
      this._animationKeys = [...animations];
      this._animationKeys.push({
        name: 'Finish Animation',
        duration: 0,
        host: this,
        callback: () => {
          resolve();
        },
      });
      this._animateNext();
    });
  }

  /** Preload any animation data needed for rendering ahead of time */
  async preload(animations: IAnimationConfig[]) {
    return Promise.all(
      animations
        .filter((cfg) => cfg.preload)
        .map((cfg) => {
          assertTrue(cfg.preload, 'invalid preload function not filtered out');
          return cfg.preload(cfg);
        })
    );
  }

  private async _animateNext() {
    const nextAnim = this._animationKeys.shift();
    if (!nextAnim) {
      return;
    }
    this._currentAnimation = nextAnim as IAnimationTask;
    this._currentAnimation.done = () => {
      this._animateNext();
    };
    await this.play(this._currentAnimation);
  }
}

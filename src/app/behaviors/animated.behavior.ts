import * as _ from 'underscore';
import {Point} from '../../game/pow-core/point';
import {TickedBehavior} from '../../game/pow2/scene/behaviors/ticked-behavior';
import {TileObject} from '../../game/pow2/tile/tile-object';
import {Component} from '@angular/core';

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

  /** callback */
  callback?: (config: IAnimationConfig) => void;
}

export interface IAnimationTask extends IAnimationConfig {
  elapsed?: number;
  start?: any; // starting value
  target?: any; // target value
  value: any; // current value
  complete?: boolean;
  startFrame: number; // The starting frame to restore when the animation is complete.
  done?: (config: IAnimationConfig) => void;

}

// Implementation
// -------------------------------------------------------------------------
@Component({
  selector: 'animated-behavior',
  template: '<ng-content></ng-content>'
})
export class AnimatedBehaviorComponent extends TickedBehavior {
  host: TileObject;

  static EVENTS = {
    Started: 'start',
    Stopped: 'stop',
    Repeated: 'repeat'
  };
  private _tasks: IAnimationTask[] = [];
  private _animationKeys: any[] = [];
  private _currentAnimation: any = null;

  play(config: IAnimationConfig) {
    const task: IAnimationTask = config as any;
    task.elapsed = 0;
    if (task.move) {
      task.startFrame = this.host.frame;
      task.start = new Point(this.host.point);
      task.target = new Point(this.host.point).clone().add(task.move);
      task.value = new Point(this.host.point);
    }
    if (typeof task.duration === 'undefined') {
      task.duration = 0;
    }
    this._tasks.push(task);
  }

  stop(config: IAnimationConfig) {
    for (let i = 0; i < this._tasks.length; i++) {
      const task: IAnimationTask = this._tasks[i];
      if (task.name === config.name) {
        task.complete = true;
      }
    }
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
        // this.host.frame = task.startFrame;
        this.trigger(AnimatedBehaviorComponent.EVENTS.Stopped, {
          task,
          component: this
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
    _.each(this._tasks, (task: IAnimationTask) => {
      if (task.elapsed > task.duration) {
        task.complete = true;
        task.elapsed = task.duration;
      }
      if (task.duration > 0) {
        const factor: number = task.elapsed / task.duration;
        // Interp point
        // console.log("Interp from " + task.start + " to " + task.target );
        if (task.move && task.move instanceof Point) {
          const interpolated: Point = task.value.interpolate(task.start, task.target, factor);
          this.host.point.x = interpolated.x;
          this.host.point.y = interpolated.y;
        }
        if (task.frames && task.frames.length) {
          const index = Math.round(this.interpolate(0, task.frames.length - 1, factor));
          const frame = task.frames[index];
          // console.log("Interp frame = " + frame);
          this.host.frame = frame;
        }
      }
      if (!task.complete) {
        task.elapsed += elapsed;
      }
    });
  }

  interpolate(from: number, to: number, factor: number): number {
    factor = Math.min(Math.max(factor, 0), 1);
    return (from * (1.0 - factor)) + (to * factor);
  }

  playChain(animations: IAnimationConfig[], cb: () => void) {
    // Inject a 0 duration animation on the end of the list
    // if a callback is desired.  This is a convenience for
    // certain coding styles, and you could easily add your
    // own animation as a callback before invoking this.
    if (typeof cb !== 'undefined') {
      animations.push({
        name: 'Chain Callback',
        duration: 0,
        callback: cb
      });
    }
    // TODO: Need a list of these for multiple animations on
    // the same component. !!!!!!!!!!!!!!!!!!!!
    this._animationKeys = animations;
    this._animateNext();
  }

  private _animateNext() {
    if (this._animationKeys.length === 0) {
      return;
    }
    this._currentAnimation = this._animationKeys.shift();
    this._currentAnimation.done = () => {
      _.defer(() => {
        this._animateNext();
      });
    };
    this.play(this._currentAnimation);
  }

}

/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Injectable} from '@angular/core';
import {Animate} from '../../services/animate';
import {GameWorld} from '../../services/game-world';
import {IWorldObject} from '../../../game/pow-core/world';
import {IProcessObject} from '../../../game/pow-core/time';

/**
 * Describe a notification that exists in the queue.
 */
export interface INotifyItem {
  /**
   * The message to display.
   */
  message: string;
  /**
   * The duration the message should be displayed after shown.
   */
  duration?: number;
  /**
   * Elapsed time since the alert has been full shown (after any enter animations)
   */
  elapsed?: number;
  /**
   * Set to dismiss.
   */
  dismissed?: boolean;
  /**
   * Set to ignore all processing for this alert.
   */
  busy?: boolean;
  /**
   * A callback for after this alert has been issued and dismissed.
   * @param message
   */
  done?(message: INotifyItem): void;
}

/**
 * Provide a basic service for queuing and showing messages to the user.
 *
 * TODO: Refactor this to use observable current notification, remove Animate service and replace with ng animations.
 */
@Injectable()
export class NotificationService implements IWorldObject, IProcessObject {
  world: GameWorld;
  paused: boolean = false;
  public animationClass: string = 'active';
  public message: string = null;

  /**
   * Default timeout in Milliseconds
   */
  defaultTimeout: number = 2500;

  set container(value: HTMLElement) {
    if (this._container) {
      this._container.removeEventListener('click', this._dismissBinding);
    }
    this._container = value;
    if (this._container) {
      this._container.addEventListener('click', this._dismissBinding);
    }
  }

  get container(): HTMLElement {
    return this._container;
  }

  private _container: HTMLElement = null;

  private _current: INotifyItem = null;
  private _queue: INotifyItem[] = [];
  private _dismissBinding: (e: any) => any = null;

  constructor(public animate: Animate) {
    this._dismissBinding = (e) => {
      this.dismiss();
    };
  }

  show(message: string, done?: () => void, duration?: number): INotifyItem {
    const obj: INotifyItem = {
      message,
      done,
      duration: typeof duration === 'undefined' ? this.defaultTimeout : duration
    };
    return this.queue(obj);
  }

  dismiss() {
    if (!this._current || this.paused) {
      return;
    }
    this.paused = true;
    this.animate.leave(this.container, this.animationClass).then(() => {
      if (this._current) {
        // Don't let exceptions in callback mess up current = null;
        try {
          if (this._current.done) {
            this._current.done(this._current);
          }
        } catch (e) {
          console.warn(e);
        }
        this._current = null;
        this.message = null;
      }
      this.paused = false;

    });
    if (this._current) {
      this._current.dismissed = true;
    }
  }

  queue(config: INotifyItem) {
    config.elapsed = 0;
    this._queue.push(config);
    return config;
  }

  /**
   * Update current message, and manage event generation for transitions
   * between messages.
   * @param elapsed number The elapsed time since the last invocation, in milliseconds.
   */
  processFrame(elapsed: number) {
    if (this._current && this.paused !== true) {
      const c = this._current;
      let timeout: boolean = c.duration && c.elapsed > c.duration;
      let dismissed: boolean = c.dismissed === true;
      if (!timeout && !dismissed) {
        c.elapsed += elapsed;
        return;
      }
      this.dismiss();
    }
    if (this.paused || this._queue.length === 0) {
      return;
    }
    this._current = this._queue.shift();
    this.paused = true;
    this.message = this._current.message;
    this.animate.enter(this.container, this.animationClass).then(() => {
      this.paused = false;
    });
  }

}

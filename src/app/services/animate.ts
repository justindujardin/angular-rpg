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
/**
 * Provide an API for animating elements with CSS transitions
 */
@Injectable()
export class Animate {

  /**
   * Look up the transition event name for the browser type and cache it.
   */
  eventName: string = this.whichTransitionEvent();

  enter(el: HTMLElement, cssClass: string): Promise<void> {
    return new Promise<void>((resolve) => {
      el.classList.add(cssClass);
      const duration = this.getTransitionDuration(el, true);
      let callTimeout;
      const done = () => {
        clearTimeout(callTimeout);
        el.removeEventListener(this.eventName, done);
        resolve();
      };
      callTimeout = setTimeout(() => done(), duration);
      el.addEventListener(this.eventName, done);
    });
  }

  leave(el: HTMLElement, cssClass: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const duration = this.getTransitionDuration(el, true);
      let callTimeout;
      const done = () => {
        clearTimeout(callTimeout);
        el.removeEventListener(this.eventName, done);
        resolve();
      };
      callTimeout = setTimeout(() => done(), duration);
      el.addEventListener(this.eventName, done);
      el.classList.remove(cssClass);
    });
  }

  /**
   * Get the duration of any transitions being applied to the given element.
   *
   * Based on: https://gist.github.com/snorpey/5323028
   * @param element The element to query
   * @param includeDelay Include any specified transition-delay value.
   * @returns {number}
   */
  getTransitionDuration(element: HTMLElement, includeDelay: boolean = false) {
    const prefixes = ['moz', 'webkit', 'ms', 'o', 'khtml'];
    const style: any = window.getComputedStyle(element);
    for (let i = 0; i < prefixes.length; i++) {
      let duration = style['-' + prefixes[i] + '-transition-duration'];
      if (!duration) {
        continue;
      }
      duration = ( duration.indexOf('ms') > -1 ) ? parseFloat(duration) : parseFloat(duration) * 1000;
      if (includeDelay) {
        let delay = style['-' + prefixes[i] + '-transition-delay'];
        if (typeof delay !== 'undefined') {
          duration += ( delay.indexOf('ms') > -1 ) ? parseFloat(delay) : parseFloat(delay) * 1000;
        }
      }
      return duration;
    }
    return 0;
  }

  /* From Modernizr */
  whichTransitionEvent(): string {
    let t: string;
    const el: any = document.createElement('fakeelement');
    const transitions: {[prefix: string]: string} = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

}

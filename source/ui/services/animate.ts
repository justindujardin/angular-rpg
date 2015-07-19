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

import '../../game';

/**
 * Provide an API for animating elements with CSS transitions
 */
export class Animate {

  /**
   * Look up the transition event name for the browser type and cache it.
   */
  eventName:string = this.whichTransitionEvent();

  enter(el:HTMLElement, cssClass:string):Promise<void> {
    return new Promise<void>((resolve)=> {
      el.classList.add(cssClass);
      var duration = this.getTransitionDuration(el, true);
      var callTimeout = setTimeout(() => done(), duration);
      var done = () => {
        clearTimeout(callTimeout);
        el.removeEventListener(this.eventName, done);
        resolve();
      };
      el.addEventListener(this.eventName, done);
    });
  }

  leave(el:HTMLElement, cssClass:string):Promise<void> {
    return new Promise<void>((resolve)=> {
      var duration = this.getTransitionDuration(el, true);
      var callTimeout = setTimeout(() => done(), duration);
      var done = () => {
        clearTimeout(callTimeout);
        el.removeEventListener(this.eventName, done);
        resolve();
      };
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
  getTransitionDuration(element:HTMLElement, includeDelay:boolean = false) {
    var prefixes = ['moz', 'webkit', 'ms', 'o', 'khtml'];
    var style:any = window.getComputedStyle(element);
    for (let i = 0; i < prefixes.length; i++) {
      let duration = style['-' + prefixes[i] + '-transition-duration'];
      if (!duration) {
        continue;
      }
      duration = ( duration.indexOf('ms') > -1 ) ? parseFloat(duration) : parseFloat(duration) * 1000;
      if (includeDelay) {
        var delay = style['-' + prefixes[i] + '-transition-delay'];
        if (typeof delay !== 'undefined') {
          duration += ( delay.indexOf('ms') > -1 ) ? parseFloat(delay) : parseFloat(delay) * 1000;
        }
      }
      return duration;
    }
    return 0;
  }

  /* From Modernizr */
  whichTransitionEvent():string {
    var t:string;
    var el:any = document.createElement('fakeelement');
    var transitions:{[prefix:string]:string} = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }


}

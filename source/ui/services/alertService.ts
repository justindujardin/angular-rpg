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

/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="./gameService.ts"/>

module rpg.services {

  export interface IPowAlertObject {
    message:string; // The message to display.
    duration?:number; // The duration the message should be displayed after shown.
    elapsed?:number; // Elapsed time since the alert has been full shown (after any enter animations)
    dismissed?:boolean; // Set to dismiss.
    busy?:boolean; // Set to ignore all processing for this alert.
    done?(message:IPowAlertObject); // A callback for after this alert has been issued and dismissed.
  }

  export interface IAlertScopeService extends ng.IRootScopeService {
    powAlert:IPowAlertObject;
  }

  export interface IPowAlertService {
    show(message:string):IPowAlertObject;
    queue(config:IPowAlertObject);
  }

  /**
   * Provide a basic service for queuing and showing messages to the user.
   */
  export class PowAlertService extends pow2.Events implements pow2.IWorldObject, pow2.IProcessObject, IPowAlertService {
    world:rpg.GameWorld;
    _uid:string = _.uniqueId('alert');
    paused:boolean = false;
    public containerSearch:string = '.ui-container';

    container:ng.IAugmentedJQuery = null;

    private _current:IPowAlertObject = null;
    private _queue:IPowAlertObject[] = [];
    private _dismissBinding:(e) => any = null;

    constructor(public element:JQuery,
                public document:any,
                public scope:IAlertScopeService,
                public timeout:ng.ITimeoutService,
                public game:PowGameService,
                public animate:any) {
      super();
      game.world.mark(this);
      game.world.time.addObject(this);
      this._dismissBinding = (e) => {
        this.dismiss();
      };
    }

    onAddToWorld(world:pow2.IWorld) {
    }

    onRemoveFromWorld(world:pow2.IWorld) {
    }

    tick(elapsed:number) {
    }

    destroy() {
      this.game.world.time.removeObject(this);
      this.game.world.erase(this);
      if (this.container) {
        this.container.off('click', this._dismissBinding);
      }
    }

    show(message:string, done?:() => void, duration?:number):IPowAlertObject {
      var obj:IPowAlertObject = {
        message: message,
        duration: typeof duration === 'undefined' ? 1000 : duration,
        done: done
      };
      return this.queue(obj);
    }

    queue(config:IPowAlertObject) {
      if (!this.container) {
        this.container = this.document.find(this.containerSearch);
        this.container.on('click', this._dismissBinding);
      }
      config.elapsed = 0;
      this._queue.push(config);
      return config;
    }

    /*
     * Update current message, and manage event generation for transitions
     * between messages.
     * @param elapsed number The elapsed time since the last invocation, in milliseconds.
     */
    processFrame(elapsed:number) {
      if (this._current && this.paused !== true) {
        var c = this._current;
        var timeout:boolean = c.duration && c.elapsed > c.duration;
        var dismissed:boolean = c.dismissed === true;
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
      this.scope.$apply(() => {
        this.paused = true;
        this.scope.powAlert = this._current;
        this.animate.enter(this.element, this.container).then(() => {
          this.paused = false;
        });
      });
    }

    dismiss() {
      if (!this._current || this.paused) {
        return;
      }
      this.paused = true;
      this.scope.$apply(() => {
        this.animate.leave(this.element).then(() => {
          if (this._current) {
            // Don't let exceptions in callback mess up current = null;
            try {
              this._current.done && this._current.done(this._current);
            }
            catch (e) {
              console.log(e);
            }
            this._current = null;
          }
          this.scope.powAlert = null;
          this.paused = false;

        });
      });
      if (this._current) {
        this._current.dismissed = true;
      }
    }

  }
  app.factory('powAlert', [
    '$rootScope',
    '$timeout',
    'game',
    '$compile',
    '$document',
    '$animate',
    ($rootScope, $timeout, game, $compile, $document, $animate) => {
      var alertElement = $compile('<div class="drop-overlay fade"><div class="message">{{powAlert.message}}</div></div>')($rootScope);
      return new PowAlertService(alertElement, $document, $rootScope, $timeout, game, $animate);
    }
  ]);
}
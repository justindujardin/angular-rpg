/*
 Copyright (C) 2013-2015 by Justin DuJardin

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

declare var _: any;


export interface IProcessObject {
  _uid?: string;
  tick?(elapsed?: number);
  processFrame?(elapsed?: number);
}

var _shared: Time = null;
export class Time {
  tickRateMS: number = 32;
  mspf: number = 0;
  world: any = null;
  lastTime: number = 0;
  time: number = 0;
  running: boolean = false;
  objects: Array<IProcessObject> = [];

  constructor() {
    this.polyFillAnimationFrames();
  }

  static get(): Time {
    if (!_shared) {
      _shared = new Time();
    }
    return _shared;
  }


  start(): Time {
    if (this.running) {
      return;
    }
    this.running = true;
    var _frameCallback: FrameRequestCallback = (time: number) => {
      if (!this.running) {
        return;
      }
      this.time = Math.floor(time);
      var now: number = new Date().getMilliseconds();
      var elapsed: number = Math.floor(time - this.lastTime);
      if (elapsed >= this.tickRateMS) {
        this.lastTime = time;
        this.tickObjects(elapsed);
      }
      this.processFrame(elapsed);
      this.mspf = new Date().getMilliseconds() - now;
      window.requestAnimationFrame(_frameCallback);
    };
    _frameCallback(0);
    return this;
  }

  stop(): Time {
    this.running = false;
    return this;
  }

  removeObject(object: IProcessObject): Time {
    this.objects = <IProcessObject[]>_.reject(this.objects, function (o: IProcessObject) {
      return o._uid === object._uid;
    });
    return this;
  }

  addObject(object: IProcessObject): Time {
    if (!object._uid) {
      object._uid = _.uniqueId("u");
    }
    if (_.where(this.objects, {_uid: object._uid}).length === 0) {
      this.objects.push(object);
    }
    return this;
  }

  tickObjects(elapsedMS: number): Time {
    var values: any[] = this.objects;
    for (var i: number = values.length - 1; i >= 0; --i) {
      values[i].tick && values[i].tick(elapsedMS);
    }
    return this;
  }

  processFrame(elapsedMS: number): Time {
    var values: any[] = this.objects;
    for (var i: number = values.length - 1; i >= 0; --i) {
      values[i].processFrame && values[i].processFrame(elapsedMS);
    }
    return this;
  }

  polyFillAnimationFrames() {
    var lastTime: number = 0;
    var vendors: Array<string> = ['ms', 'moz', 'webkit', 'o'];
    for (var i: number = 0; i < vendors.length; i++) {
      if (window.requestAnimationFrame) {
        return;
      }
      window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback: FrameRequestCallback): number {
        var currTime: number = new Date().getTime();
        var timeToCall: number = Math.max(0, 16 - (currTime - lastTime));
        var tickListener: Function = function () {
          callback(currTime + timeToCall);
        };
        var id: number = window.setTimeout(tickListener, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
  }
}

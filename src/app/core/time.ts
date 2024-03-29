import { Injectable } from '@angular/core';
import * as _ from 'underscore';

export interface IProcessObject {
  _uid?: string;
  tick?(elapsed?: number): void;
  processFrame?(elapsed?: number): void;
}

let _shared: Time | null = null;

@Injectable()
export class Time {
  tickRateMS: number = 32;
  mspf: number = 0;
  world: any = null;
  lastTime: number = 0;
  time: number = 0;
  running: boolean = false;
  objects: IProcessObject[] = [];

  constructor() {}

  static get(): Time {
    if (!_shared) {
      _shared = new Time();
    }
    return _shared;
  }

  start(): Time {
    if (this.running) {
      return this;
    }
    this.running = true;
    const _frameCallback: FrameRequestCallback = (time: number) => {
      if (!this.running) {
        return;
      }
      this.time = Math.floor(time);
      const now: number = new Date().getMilliseconds();
      const elapsed: number = Math.floor(time - this.lastTime);
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
    this.objects = _.reject(this.objects, (o: IProcessObject) => {
      return o._uid === object._uid;
    }) as IProcessObject[];
    return this;
  }

  addObject(object: IProcessObject): Time {
    if (!object._uid) {
      object._uid = _.uniqueId('u');
    }
    if (_.where(this.objects, { _uid: object._uid }).length === 0) {
      this.objects.push(object);
    }
    return this;
  }

  tickObjects(elapsedMS: number): Time {
    const values: any[] = this.objects;
    for (let i: number = values.length - 1; i >= 0; --i) {
      if (values[i].tick) {
        values[i].tick(elapsedMS);
      }
    }
    return this;
  }

  processFrame(elapsedMS: number): Time {
    const values: any[] = this.objects;
    for (let i: number = values.length - 1; i >= 0; --i) {
      if (values[i].processFrame) {
        values[i].processFrame(elapsedMS);
      }
    }
    return this;
  }
}

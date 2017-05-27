import {IProcessObject, Time} from './time';
import {Events} from './events';
import * as _ from 'underscore';

class MockTimeObject extends Events implements IProcessObject {
  _uid: string = _.uniqueId('p');

  tick(elapsed: number) {
    this.trigger('tick');
  }
}

describe('Time', () => {
  it('should be defined', () => {
    expect(Time).toBeDefined();
  });

  it('should expose a static instance for shared use', () => {
    const t: Time = Time.get();
    expect(t.polyFillAnimationFrames).toBeDefined();
  });

  describe('addObject', () => {
    it('should generate unique id if _uid is not an object property', () => {
      const obj: any = {};
      const t: Time = Time.get();
      t.addObject(obj);
      expect(obj._uid).toBeDefined();
      expect(typeof obj._uid).toBe('string');
    });
  });

  function setupTimeCounter(time: Time): any {
    const counter = {
      ticks: 0,
      frames: 0,
      tick() {
        counter.ticks++;
      },
      processFrame() {
        counter.frames++;
      }
    };
    time.addObject(counter);
    return counter;
  }

  describe('start', () => {
    it('should start tick/processFrame loop', (done) => {
      const time = new Time();
      const counter = setupTimeCounter(time);
      expect(counter.ticks).toBe(0);
      expect(counter.frames).toBe(0);
      time.start();
      _.delay(() => {
        expect(counter.ticks).toBeGreaterThan(0);
        expect(counter.frames).toBeGreaterThan(0);
        time.removeObject(counter);
        time.stop();
        done();
      }, 50);
    });
  });

  describe('stop', () => {
    it('should stop tick/processFrame loop', (done) => {
      const time = new Time();
      const counter = setupTimeCounter(time);
      time.start();
      _.defer(() => {
        time.stop();
        const ticks = counter.ticks;
        const frames = counter.frames;
        _.delay(() => {
          expect(counter.ticks).toBe(ticks);
          expect(counter.frames).toBe(frames);
          time.removeObject(counter);
          time.stop();
          done();
        }, 50);
      });
    });
  });

  describe('polyFillAnimationFrames', () => {
    it('should trigger time updates with polyfill and setInterval', (done) => {
      let olds: any = {
        requestAnimationFrame: window.requestAnimationFrame
      };
      const vendors = ['ms', 'moz', 'webkit', 'o'];
      for (let i = 0; i < vendors.length; i++) {
        olds = window[vendors[i] + 'RequestAnimationFrame'];
        window[vendors[i] + 'RequestAnimationFrame'] = null;
      }
      window.requestAnimationFrame = null;

      const t: Time = new Time();
      const m: MockTimeObject = new MockTimeObject();
      t.addObject(m);
      m.once('tick', () => {
        t.stop();
        t.removeObject(m);
        expect(window.requestAnimationFrame).toBeDefined();
        _.each(olds, (value, key: any) => {
          window[key] = value;
        });
        done();
      });
      t.start();
    });

  });

  const functions = [
    'webkitRequestAnimationFrame',
    'mozRequestAnimationFrame'
  ];
  functions.forEach((fnName) => {
    const w: any = window;
    if (!w[fnName]) {
      return;
    }
    it('should apply polyfill if not present on window', () => {
      const oldRaf: any = w.requestAnimationFrame;
      const oldVendorRaf: any = w[fnName];

      w.requestAnimationFrame = null;
      w[fnName] = null;

      let t = new Time();
      expect(window.requestAnimationFrame).toBeDefined();

      w.requestAnimationFrame = oldRaf;
      w[fnName] = oldVendorRaf;
    });
    it('should be patched as requestAnimationFrame if present on window', () => {
      if (window.hasOwnProperty(fnName)) {
        const oldRaf: any = w.requestAnimationFrame;
        w.requestAnimationFrame = null;
        let t = new Time();
        expect(window.requestAnimationFrame).toBeDefined();
        w.requestAnimationFrame = oldRaf;
      }
    });
  });
});

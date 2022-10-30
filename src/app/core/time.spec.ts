import * as _ from 'underscore';
import { Time } from './time';

describe('Time', () => {
  it('should be defined', () => {
    expect(Time).toBeDefined();
  });

  it('should expose a static instance for shared use', () => {
    const t: Time = Time.get();
    expect(t).toBeDefined();
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
      },
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
      }, 100);
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
});

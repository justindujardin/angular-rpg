
import { getSpriteMeta } from './api';
/**
 * Really Janky class to play animations associated with a pow2 sprite.
 *
 * Give it a sprite name `setAnimationSource('ninja-female.png')` and
 * if it has `animations` associated with it from meta data, e.g. `ninja-female.json`
 * those animations will be available to play through this interface.
 *
 * The user has to call `updateTime` on the instance whenever time is
 * incremented.
 *
 * TODO: It's so ugly now.  Make it better.
 */
export class Animator {
  interpFrame: number = 0;
  animElapsed: number = 0;
  animDuration: number = 0;
  frames: number[] = [0];

  sourceMeta: any = null;
  sourceAnims: any = null;

  setAnimationSource(spriteName: string) {
    console.log(`Sprite is ${spriteName}`);
    this.sourceMeta = getSpriteMeta(spriteName);
    if (this.sourceMeta) {
      this.sourceAnims = this.sourceMeta.animations;
      this.setAnimation('down');
    }
  }

  setAnimation(name: string) {
    if (!this.sourceAnims) {
      throw new Error('Invalid source animations');
    }
    const data: any = this.sourceAnims[name];
    if (!data) {
      throw new Error(`Invalid animation name - ${name}`);
    }
    this.frames = data.frames;
    this.animDuration = data.duration;
  }

  updateTime(elapsedMs: number) {
    this.animElapsed += elapsedMs;
    const factor: number = this.animElapsed / this.animDuration;
    const index = Math.round(this.interpolate(0, this.frames.length - 1, factor));
    this.interpFrame = this.frames[index];
    if (this.animElapsed > this.animDuration) {
      this.animElapsed = 0;
    }
  }

  interpolate(from: number, to: number, factor: number): number {
    factor = Math.min(Math.max(factor, 0), 1);
    return from * (1.0 - factor) + to * factor;
  }

  getFrame(): number {
    return this.interpFrame;
  }
}


import { EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import { AudioResource } from '../core';
import { GameWorld } from '../services/game-world';
import { SceneObjectBehavior } from './scene-object-behavior';

export interface SoundComponentOptions {
  url: string | null;
  loop?: boolean;
  volume?: number;
}

const DEFAULTS: SoundComponentOptions = {
  url: null,
  volume: 1,
  loop: false,
};

export class SoundBehavior
  extends SceneObjectBehavior
  implements SoundComponentOptions
{
  url: string;
  volume: number;
  loop: boolean;
  audio: AudioResource;

  /** Emits when the sound is done (when not looping) */
  onDone$ = new EventEmitter<SoundBehavior>();
  /** Emits when the sound loops */
  onLoop$ = new EventEmitter<SoundBehavior>();

  constructor(options: SoundComponentOptions = DEFAULTS) {
    super();
    if (typeof options !== 'undefined') {
      _.extend(this, DEFAULTS, options);
    }
  }

  disconnectBehavior(): boolean {
    if (this.audio && this.audio.data) {
      this.audio.data.pause();
      this.audio.data.currentTime = 0;
      if (this.audio.data.removeAllListeners) {
        this.audio.data.removeAllListeners('timeupdate');
      }
    }
    return super.disconnectBehavior();
  }

  connectBehavior(): boolean {
    if (!super.connectBehavior() || !this.url) {
      return false;
    }
    if (this.audio && this.audio.data) {
      this.audio.data.currentTime = 0;
      this.audio.data.volume = this.volume;
      return true;
    }
    const world = GameWorld.get();
    if (!world || !world.loader) {
      return false;
    }
    world.loader.load(this.url).then((resources: AudioResource[]) => {
      const res = resources[0];
      this.audio = res;
      if (this.audio.data) {
        this.audio.data.currentTime = 0;
        this.audio.data.volume = this.volume;
        this.audio.data.loop = this.loop;
        this.audio.data.play();
        this.audio.data.addEventListener('timeupdate', () => {
          if (this.audio.data.currentTime >= this.audio.data.duration) {
            if (!this.loop) {
              this.audio.data.pause();
              this.onDone$.emit(this);
            } else {
              this.onLoop$.emit(this);
            }
          }
        });
      }
    });
    return true;
  }
}

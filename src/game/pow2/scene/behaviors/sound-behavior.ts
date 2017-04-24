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
import * as _ from 'underscore';
import {SceneObjectBehavior} from '../scene-object-behavior';
import {AudioResource} from '../../../pow-core/resources/audio.resource';
import {GameWorld} from '../../../../app/services/game-world';

export interface SoundComponentOptions {
  url: string;
  loop?: boolean;
  volume?: number;
}

const DEFAULTS: SoundComponentOptions = {
  url: null,
  volume: 1,
  loop: false
};

export class SoundBehavior extends SceneObjectBehavior implements SoundComponentOptions {
  url: string;
  volume: number;
  loop: boolean;
  audio: AudioResource;

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
              this.trigger('audio:done', this);
            }
            else {
              this.trigger('audio:loop', this);
            }
          }
        });
      }
    });
    return true;
  }
}

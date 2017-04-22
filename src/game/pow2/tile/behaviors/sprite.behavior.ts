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
import {SceneObjectBehavior} from '../../scene/scene-object-behavior';
import {TileObject} from '../tile-object';
import {ImageResource} from '../../../pow-core/resources/image.resource';
import {ISpriteMeta} from '../../core/api';

export interface SpriteComponentOptions {
  icon: string;
  image?: HTMLImageElement;
  name?: string;
  frame?: number;
  meta?: ISpriteMeta;
}

export class SpriteComponent extends SceneObjectBehavior {
  host: TileObject;
  image: HTMLImageElement;
  visible: boolean;
  enabled: boolean;

  // Game Sprite support.
  // ----------------------------------------------------------------------
  // The sprite name, e.g. "entity.png" or "knight.png"
  icon: string;
  // The sprite sheet source information
  meta: ISpriteMeta;
  // The sprite frame (if applicable)
  frame: number = 0;

  get scale(): number {
    return this.host ? this.host.scale : 1;
  }

  constructor(options?: SpriteComponentOptions) {
    super();
    if (typeof options !== 'undefined') {
      _.extend(this, options);
    }
  }

  syncBehavior(): boolean {
    if (this.host.world) {
      this.setSprite(this.icon, this.frame);
    }
    return super.syncBehavior();
  }

  /**
   * Set the current sprite name.  Returns the previous sprite name.
   */
  setSprite(name: string, frame: number = 0): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (name === this.icon && this.image && this.meta) {
        return resolve(this.icon);
      }
      this.icon = name;
      if (!name) {
        this.meta = null;
        return resolve(null);
      }
      this.meta = this.host.world.sprites.getSpriteMeta(name);
      this.host.world.sprites.getSpriteSheet(this.meta.source)
        .then((images: ImageResource[]) => {
          this.image = images[0].data;
          this.frame = frame;
          resolve(this.icon);
        })
        .catch(reject);
    });
  }
}

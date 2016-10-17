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
import {SceneComponent} from '../../scene/sceneComponent';
import {TileObject} from '../tileObject';
import {ImageResource} from '../../../pow-core/resources/image';

export interface SpriteComponentOptions {
  icon: string;
  name?: string;
  frame?: number;
}

export class SpriteComponent extends SceneComponent {
  host: TileObject;
  image: HTMLImageElement;
  visible: boolean;
  enabled: boolean;

  // Game Sprite support.
  // ----------------------------------------------------------------------
  // The sprite name, e.g. "party.png" or "knight.png"
  icon: string;
  // The sprite sheet source information
  meta: any;
  // The sprite frame (if applicable)
  frame: number = 0;

  constructor(options?: SpriteComponentOptions) {
    super();
    if (typeof options !== 'undefined') {
      _.extend(this, options);
    }
  }

  syncComponent(): boolean {
    if (this.host.world) {
      this.setSprite(this.icon, this.frame);
    }
    return super.syncComponent();
  }

  /**
   * Set the current sprite name.  Returns the previous sprite name.
   */
  setSprite(name: string, frame: number = 0): string {
    var oldSprite: string = this.icon;
    if (!name) {
      this.meta = null;
    }
    else {
      this.meta = this.host.world.sprites.getSpriteMeta(name);
      this.host.world.sprites.getSpriteSheet(this.meta.source).then((images: ImageResource[]) => {
        this.image = images[0].data;
      });
    }
    this.icon = name;
    return oldSprite;
  }
}

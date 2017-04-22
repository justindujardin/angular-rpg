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
import {SpriteComponent} from './sprite.behavior';
import {TickedBehavior} from '../../scene/behaviors/ticked-behavior';
import {TileObject} from '../tile-object';
export interface AnimatedSpriteComponentOptions {
  lengthMS?: number;
  spriteName: string;
}

export class AnimatedSpriteBehavior extends TickedBehavior {
  host: TileObject;
  _elapsed: number = 0;
  private _renderFrame: number = 3;
  lengthMS: number = 500;
  spriteComponent: SpriteComponent;
  spriteName: string;

  constructor(options: AnimatedSpriteComponentOptions = {
    lengthMS: 500,
    spriteName: null
  }) {
    super();
    if (typeof options !== 'undefined') {
      _.extend(this, options);
    }
  }

  connectBehavior(): boolean {
    this._renderFrame = 0;
    this._elapsed = 0;
    return super.connectBehavior();
  }

  syncBehavior(): boolean {
    if (!super.syncBehavior()) {
      return false;
    }
    const sprites = this.host.findBehaviors(SpriteComponent) as SpriteComponent[];
    this.spriteComponent = _.where(sprites, {name: this.spriteName})[0] as SpriteComponent;
    return !!this.spriteComponent;
  }

  tick(elapsed: number) {
    this._elapsed += elapsed;
    if (this._elapsed >= this.lengthMS) {
      this.trigger('animation:done', this);
      this._elapsed = this._elapsed % this.lengthMS;
    }
    super.tick(elapsed);
  }

  interpolateTick(elapsed: number) {
    if (this.spriteComponent && this.spriteComponent.meta) {
      // Choose frame for interpolated position
      const factor = this._elapsed / this.lengthMS;
      /* tslint:disable */
      this.spriteComponent.frame = (factor * this.spriteComponent.meta.frames) | 0;
      /* tslint:enable */
    }
    super.interpolateTick(elapsed);
  }
}

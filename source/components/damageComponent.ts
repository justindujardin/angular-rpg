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

/// <reference path="./gameComponent.ts" />

import {GameEntityObject} from '../objects/gameEntityObject';

export class DamageComponent extends pow2.scene.SceneComponent {
  host:GameEntityObject;
  animation:pow2.tile.components.AnimatedSpriteComponent;
  sprite:pow2.tile.components.SpriteComponent;
  sound:pow2.scene.components.SoundComponent;
  started:boolean = false;

  syncComponent():boolean {
    if (!super.syncComponent()) {
      return false;
    }
    this.animation = <pow2.tile.components.AnimatedSpriteComponent>
        this.host.findComponent(pow2.tile.components.AnimatedSpriteComponent);
    this.sprite = <pow2.tile.components.SpriteComponent>
        this.host.findComponent(pow2.tile.components.SpriteComponent);
    this.sound = <pow2.scene.components.SoundComponent>
        this.host.findComponent(pow2.scene.components.SoundComponent);
    var ok = !!(this.animation && this.sprite);
    if (!this.started && ok) {
      this.started = true;
      this.animation.once('animation:done', () => {
        this.trigger('damage:done', this);
      });
    }
    return ok;
  }
}

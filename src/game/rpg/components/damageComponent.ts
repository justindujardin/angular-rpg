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

import {GameEntityObject} from '../objects/gameEntityObject';
import {SceneComponent} from '../../pow2/scene/sceneComponent';
import {AnimatedSpriteComponent} from '../../pow2/tile/components/animatedSpriteComponent';
import {SpriteComponent} from '../../pow2/tile/components/spriteComponent';
import {SoundComponent} from '../../pow2/scene/components/soundComponent';

export class DamageComponent extends SceneComponent {
  host: GameEntityObject;
  animation: AnimatedSpriteComponent;
  sprite: SpriteComponent;
  sound: SoundComponent;
  started: boolean = false;

  syncBehavior(): boolean {
    if (!super.syncBehavior()) {
      return false;
    }
    this.animation = <AnimatedSpriteComponent>
      this.host.findBehavior(AnimatedSpriteComponent);
    this.sprite = <SpriteComponent>
      this.host.findBehavior(SpriteComponent);
    this.sound = <SoundComponent>
      this.host.findBehavior(SoundComponent);
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

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
import {GameEntityObject} from '../scene/game-entity-object';
import {SceneObjectBehavior} from '../../game/pow2/scene/scene-object-behavior';
import {AnimatedSpriteBehavior} from '../../game/pow2/tile/behaviors/animated-sprite.behavior';
import {SpriteComponent} from '../../game/pow2/tile/behaviors/sprite.behavior';
import {SoundBehavior} from '../../game/pow2/scene/behaviors/sound-behavior';

export class DamageComponent extends SceneObjectBehavior {
  host: GameEntityObject;
  animation: AnimatedSpriteBehavior;
  sprite: SpriteComponent;
  sound: SoundBehavior;
  started: boolean = false;

  syncBehavior(): boolean {
    if (!super.syncBehavior()) {
      return false;
    }
    this.animation = <AnimatedSpriteBehavior>
      this.host.findBehavior(AnimatedSpriteBehavior);
    this.sprite = <SpriteComponent>
      this.host.findBehavior(SpriteComponent);
    this.sound = <SoundBehavior>
      this.host.findBehavior(SoundBehavior);
    const ok = !!(this.animation && this.sprite);
    if (!this.started && ok) {
      this.started = true;
      this.animation.once('animation:done', () => {
        this.trigger('damage:done', this);
      });
    }
    return ok;
  }
}

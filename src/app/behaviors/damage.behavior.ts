/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import { EventEmitter } from '@angular/core';
import { GameEntityObject } from '../scene/objects/game-entity-object';
import { AnimatedSpriteBehavior } from './animated-sprite.behavior';
import { SceneObjectBehavior } from './scene-object-behavior';
import { SoundBehavior } from './sound-behavior';
import { SpriteComponent } from './sprite.behavior';

export class DamageComponent extends SceneObjectBehavior {
  host: GameEntityObject | null;
  animation: AnimatedSpriteBehavior | null;
  sprite: SpriteComponent | null;
  sound: SoundBehavior | null;
  started: boolean = false;

  /** Emits when the damage animation is complete */
  onDone$ = new EventEmitter<DamageComponent>();

  syncBehavior(): boolean {
    if (!super.syncBehavior() || !this.host) {
      return false;
    }
    this.animation = <AnimatedSpriteBehavior>(
      this.host.findBehavior(AnimatedSpriteBehavior)
    );
    this.sprite = this.host.findBehavior<SpriteComponent>(SpriteComponent);
    this.sound = this.host.findBehavior<SoundBehavior>(SoundBehavior);
    const ok = !!(this.animation && this.sprite);
    if (!this.started && ok) {
      this.started = true;
      let sub = this.animation.onDone$.subscribe(() => {
        sub?.unsubscribe();
        this.onDone$.emit(this);
      });
    }
    return ok;
  }
}

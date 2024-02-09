
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

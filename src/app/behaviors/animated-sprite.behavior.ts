
import { EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import { TileObject } from '../scene/tile-object';
import { SpriteComponent } from './sprite.behavior';
import { TickedBehavior } from './ticked-behavior';
export interface AnimatedSpriteComponentOptions {
  lengthMS?: number;
  spriteName: string | null;
}

export class AnimatedSpriteBehavior extends TickedBehavior {
  host: TileObject;
  _elapsed: number = 0;
  lengthMS: number = 500;
  spriteComponent: SpriteComponent;
  spriteName: string;

  /** Emits when the animation is done playing */
  onDone$ = new EventEmitter<AnimatedSpriteBehavior>();

  constructor(
    options: AnimatedSpriteComponentOptions = {
      lengthMS: 500,
      spriteName: null,
    }
  ) {
    super();
    if (typeof options !== 'undefined') {
      _.extend(this, options);
    }
  }

  connectBehavior(): boolean {
    this._elapsed = 0;
    return super.connectBehavior();
  }

  syncBehavior(): boolean {
    if (!super.syncBehavior()) {
      return false;
    }
    const sprites = this.host.findBehaviors(SpriteComponent) as SpriteComponent[];
    this.spriteComponent = _.where(sprites, {
      name: this.spriteName,
    })[0] as SpriteComponent;
    return !!this.spriteComponent;
  }

  tick(elapsed: number) {
    this._elapsed += elapsed;
    if (this._elapsed >= this.lengthMS) {
      this.onDone$.emit(this);
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

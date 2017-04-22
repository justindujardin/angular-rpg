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
import {GameFeatureObject} from '../../../scene/game-feature-object';
import {TickedBehavior} from '../../../../game/pow2/scene/behaviors/ticked-behavior';
import {TileObject} from '../../../../game/pow2/tile/tile-object';
import {CollisionBehaviorComponent} from '../../../behaviors/collision.behavior';
import {PlayerBehaviorComponent} from './player-behavior';
import {Component, Output, EventEmitter} from '@angular/core';

/**
 * A Component that collides with features that are directly in front
 * of a player, and fires enter/leave events for them.
 */
@Component({
  selector: 'player-look-behavior',
  template: `<ng-content></ng-content>`
})
export class PlayerTriggerBehaviorComponent extends TickedBehavior {
  host: TileObject;
  collider: CollisionBehaviorComponent = null;
  player: PlayerBehaviorComponent = null;

  private featureObject: GameFeatureObject = null;

  /**
   * The player has touched a game feature.
   */
  @Output() onLook: EventEmitter<GameFeatureObject> = new EventEmitter();

  /**
   * The player was touching a game feature, and is now leaving.
   */
  @Output() onLookAway: EventEmitter<GameFeatureObject> = new EventEmitter();

  syncBehavior(): boolean {
    super.syncBehavior();
    this.player = this.host.findBehavior(PlayerBehaviorComponent) as PlayerBehaviorComponent;
    this.collider = this.host.findBehavior(CollisionBehaviorComponent) as CollisionBehaviorComponent;
    return !!(this.player && this.collider);
  }

  tick(elapsed: number) {
    super.tick(elapsed);
    if (!this.player || !this.collider) {
      return;
    }
    const results: GameFeatureObject[] = [];
    const headingX: number = this.host.point.x + this.player.heading.x;
    const headingY: number = this.host.point.y + this.player.heading.y;
    const isTouching: boolean = this.collider.collide(headingX, headingY, GameFeatureObject, results);
    const touched: GameFeatureObject = results[0];
    const currentTouchId: string = this.featureObject ? this.featureObject._uid : null;
    const touchChanged: boolean = !!(touched && touched._uid !== currentTouchId);
    // No collisions for this tick
    if (!isTouching || !touched || touchChanged) {
      // If we were previously colliding with a feature, trigger the leave output.
      if (this.featureObject) {
        this.onLookAway.emit(this.featureObject);
        // And clean up the reference so we don't fire the event more than once
        this.featureObject = null;
      }
    }

    // Colliding with a feature
    if (touched && isTouching) {
      this.featureObject = touched;
      if (touchChanged) {
        this.onLook.emit(this.featureObject);
      }
    }
  }
}

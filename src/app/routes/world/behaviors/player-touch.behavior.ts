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
import {GameFeatureComponent} from '../../../../game/rpg/components/gameFeatureComponent';
import {GameFeatureObject} from '../../../../game/rpg/objects/gameFeatureObject';
import {TickedComponent} from '../../../../game/pow2/scene/components/tickedComponent';
import {TileObject} from '../../../../game/pow2/tile/tileObject';
import {CollisionBehaviorComponent} from '../../../behaviors/collision.behavior';
import {PlayerBehaviorComponent} from './player-behavior';
import {Component} from '@angular/core';

/**
 * A Component that collides with features that are directly in front
 * of a player, that the player is 'touching' by facing them.
 */
@Component({
  selector: 'player-touch-behavior',
  template: `<ng-content></ng-content>`
})
export class PlayerTouchBehaviorComponent extends TickedComponent {
  host: TileObject;
  collider: CollisionBehaviorComponent = null;
  player: PlayerBehaviorComponent = null;
  touch: GameFeatureObject = null;
  touchedComponent: GameFeatureComponent = null;

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
    const headingX = this.host.point.x + this.player.heading.x;
    const headingY = this.host.point.y + this.player.heading.y;
    const newTouch: boolean = this.collider.collide(headingX, headingY, GameFeatureObject, results);
    const touched = _.find(results, (r: GameFeatureObject) => !!r.findBehavior(GameFeatureComponent));
    if (!newTouch || !touched) {
      if (this.touchedComponent) {
        this.touchedComponent.exit(this.host);
        this.touchedComponent = null;
      }
      this.touch = null;
    }
    else {
      const touchComponent = touched.findBehavior(GameFeatureComponent) as GameFeatureComponent;
      const previousTouch = this.touchedComponent ? this.touchedComponent.id : null;
      if (this.touchedComponent && this.touchedComponent.id !== touchComponent.id) {
        this.touchedComponent.exit(this.host);
        this.touchedComponent = null;
      }

      this.touchedComponent = touchComponent;
      if (touchComponent.id !== previousTouch) {
        this.touchedComponent.enter(this.host);
      }
      this.touch = touched;
    }
  }
}

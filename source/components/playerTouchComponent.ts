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

import {GameComponent} from './gameComponent';
import {GameFeatureComponent} from './gameFeatureComponent';
import {GameFeatureObject} from '../objects/gameFeatureObject';

/**
 * A Component that collides with features that are directly in front
 * of a player, that the player is 'touching' by facing them.
 */
export class PlayerTouchComponent extends pow2.scene.components.TickedComponent {
  host:pow2.tile.TileObject;
  collider:pow2.scene.components.CollisionComponent = null;
  player:pow2.scene.components.PlayerComponent = null;
  touch:GameFeatureObject = null;
  touchedComponent:GameFeatureComponent = null;

  syncComponent():boolean {
    super.syncComponent();
    this.player = <pow2.scene.components.PlayerComponent>
        this.host.findComponent(pow2.scene.components.PlayerComponent);
    this.collider = <pow2.scene.components.CollisionComponent>
        this.host.findComponent(pow2.scene.components.CollisionComponent);
    return !!(this.player && this.collider);
  }

  tick(elapsed:number) {
    super.tick(elapsed);
    if (!this.player || !this.collider) {
      return;
    }
    var results:GameFeatureObject[] = [];
    var newTouch:boolean = this.collider.collide(this.host.point.x + this.player.heading.x, this.host.point.y + this.player.heading.y, GameFeatureObject, results);
    var touched = <GameFeatureObject>_.find(results, (r:GameFeatureObject) => {
      return !!r.findComponent(GameFeatureComponent);
    });
    if (!newTouch || !touched) {
      if (this.touchedComponent) {
        this.touchedComponent.exit(this.host);
        this.touchedComponent = null;
      }
      this.touch = null;
    }
    else {
      var touchComponent = <GameFeatureComponent>touched.findComponent(GameFeatureComponent);
      var previousTouch = this.touchedComponent ? this.touchedComponent.id : null;
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

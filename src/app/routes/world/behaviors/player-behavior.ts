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
import {GameEntityObject} from '../../../scene/game-entity-object';
import {GameFeatureObject} from '../../../scene/game-feature-object';
import {BasePlayerComponent} from '../../../behaviors/base-player.behavior';
import {TileMap} from '../../../../game/pow2/tile/tile-map';
import {SceneObject} from '../../../../game/pow2/scene/scene-object';
import {IMoveDescription} from '../../../../game/pow2/scene/behaviors/movable-behavior';
import {GameStateMoveAction} from '../../../models/game-state/game-state.actions';
import {Component, EventEmitter, Output} from '@angular/core';
import {ITiledLayer} from '../../../../game/pow-core/resources/tiled/tiled.model';

@Component({
  selector: 'player-behavior',
  template: `<ng-content></ng-content>`
})
export class PlayerBehaviorComponent extends BasePlayerComponent {
  host: GameEntityObject;
  map: TileMap = null;

  static COLLIDE_TYPES: string[] = [
    'TempleFeatureComponent',
    'StoreFeatureComponent',
    'DialogFeatureComponent',
    'CombatFeatureComponent',
    'sign'
  ];

  /**
   * Output when a move on the map is completed.
   */
  @Output() onCompleteMove = new EventEmitter<IMoveDescription>();

  /**
   * Collide with the rpg tile map features and obstacles.
   */
  collideMove(x: number, y: number, results: SceneObject[] = []) {
    if (this.host.scene && !this.map) {
      this.map = this.host.scene.objectByType(TileMap) as TileMap;
    }
    let i = 0;

    const collision: boolean = this.collider && this.collider.collide(x, y, GameFeatureObject, results);
    if (collision) {
      for (i = 0; i < results.length; i++) {
        const o = <GameFeatureObject> results[i];
        if (o.passable === true || !o.type) {
          return false;
        }
        if (_.indexOf(PlayerBehaviorComponent.COLLIDE_TYPES, o.type) !== -1) {
          return true;
        }
      }
    }
    // Iterate over all layers of the map, check point(x,y) and see if the tile
    // has any unpassable attributes set on it.  If any unpassable attributes are
    // found, there is a collision.
    if (this.map) {
      const layers: ITiledLayer[] = this.map.getLayers();
      for (i = 0; i < layers.length; i++) {
        const terrain = this.map.getTileData(layers[i], x, y);
        if (!terrain) {
          continue;
        }
        for (let j = 0; j < this.passableKeys.length; j++) {
          if (terrain[this.passableKeys[j]] === false) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Called when a complete tick of movement occurs.
   * @param move The move that is now completed.
   */
  completeMove(move: IMoveDescription) {
    // HACKS: Need an injection strategy for these behavior components.
    this.host.world.store.dispatch(new GameStateMoveAction(move.to));
    this.onCompleteMove.next(move);
    super.completeMove(move);
  }

}

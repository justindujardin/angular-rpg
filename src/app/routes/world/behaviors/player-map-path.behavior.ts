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
import {BasePlayerComponent} from '../../../behaviors/base-player.behavior';
import {TileMapPathBehavior} from '../../../../game/pow2/tile/behaviors/tile-map-path.behavior';
import {ITiledLayer} from '../../../../game/pow-core/resources/tiled/tiled.model';
import {Component, Input} from '@angular/core';
import {GameTileMap} from '../../../scene/game-tile-map';
/**
 * Build Astar paths with GameFeatureObject tilemaps.
 */
@Component({
  selector: 'player-map-path-behavior',
  template: `
    <ng-content></ng-content>`
})
export class PlayerMapPathBehaviorComponent extends TileMapPathBehavior {
  @Input() tileMap: GameTileMap;

  buildWeightedGraph(): number[][] {
    let x: number;
    const layers: ITiledLayer[] = this.tileMap.getLayers();
    const l: number = layers.length;

    const grid = new Array(this.tileMap.bounds.extent.x);
    for (x = 0; x < this.tileMap.bounds.extent.x; x++) {
      grid[x] = new Array(this.tileMap.bounds.extent.y);
    }

    for (x = 0; x < this.tileMap.bounds.extent.x; x++) {
      for (let y: number = 0; y < this.tileMap.bounds.extent.y; y++) {

        // Tile Weights, the higher the value the more avoided the
        // tile will be in output paths.

        // 10   - neutral path, can walk, don't particularly care for it.
        // 1    - desired path, can walk and tend toward it over netural.
        // 1000 - blocked path, can't walk, avoid at all costs.
        let weight: number = 10;
        let blocked: boolean = false;
        for (let i = 0; i < l; i++) {
          // If there is no metadata continue
          const terrain = this.tileMap.getTileData(layers[i], x, y);
          if (!terrain) {
            continue;
          }

          // Check to see if any layer has a passable attribute set to false,
          // if so block the path.
          if (terrain.passable === false) {
            weight = 1000;
            blocked = true;
          }
          else if (terrain.isPath === true) {
            weight = 1;
          }
        }
        grid[x][y] = weight;
      }
    }

    // TOOD: Tiled Editor format is KILLIN' me.
    _.each(this.tileMap.features.objects, (o: any) => {
      const obj: any = o.properties;
      if (!obj) {
        return;
      }
      const collideTypes: string[] = BasePlayerComponent.COLLIDE_TYPES;
      if (obj.passable === true || !obj.type) {
        return;
      }
      if (_.indexOf(collideTypes, obj.type) !== -1) {
        /* tslint:disable */
        const xPos: number = o.x / o.width | 0;
        const yPos: number = o.y / o.height | 0;
        /* tslint:enable */
        if (!obj.passable && this.tileMap.bounds.pointInRect(xPos, yPos)) {
          grid[xPos][yPos] = 100;
        }
      }
    });
    return grid;
  }
}

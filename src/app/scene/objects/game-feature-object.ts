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
import { TiledMapFeatureData } from '../../routes/world/map/map-feature.component';
import { GameWorld } from '../../services/game-world';
import { SceneView } from '../scene-view';
import { TileMap } from '../tile-map';
import { TileObject } from '../tile-object';

export class GameFeatureObject extends TileObject {
  world: GameWorld;
  feature: TiledMapFeatureData;

  constructor(options: TiledMapFeatureData, public tileMap: TileMap) {
    super();
    this.feature = options;
    if (options.gid) {
      this.gid = options.gid;
    }
    if (options.properties?.icon) {
      this.icon = options.properties.icon;
    }
    this.point.x = Math.round(options.x / SceneView.UNIT);
    this.point.y = Math.round(options.y / SceneView.UNIT);
  }
}

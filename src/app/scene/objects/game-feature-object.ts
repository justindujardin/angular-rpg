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

import { BehaviorSubject, Observable } from 'rxjs';
import { ITiledObject } from '../../core/resources/tiled/tiled.model';
import { GameWorld } from '../../services/game-world';
import { SceneView } from '../scene-view';
import { TileMap } from '../tile-map';
import { TileObject } from '../tile-object';

export class GameFeatureObject extends TileObject {
  world: GameWorld;

  feature: ITiledObject | null;

  setFeature(value: ITiledObject | null) {
    if (value?.gid) {
      this.gid = value.gid;
    }
    if (value?.properties?.icon) {
      this.icon = value.properties.icon;
    }
    if (value?.x) {
      this.point.x = Math.round(value.x / SceneView.UNIT);
    }
    if (value?.y) {
      this.point.y = Math.round(value.y / SceneView.UNIT);
    }
    this._feature$.next(value);
  }

  protected _feature$ = new BehaviorSubject<ITiledObject | null>(null);
  feature$: Observable<ITiledObject | null> = this._feature$;

  constructor(
    feature: ITiledObject | null = null,
    public tileMap: TileMap | null = null
  ) {
    super();
    this.feature = feature;
  }
}

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

/// <reference path="./gameTileMap.ts"/>

module rpg {
  export class RPGMapView extends pow2.game.GameMapView {
    tileMap:rpg.GameTileMap = null;

    private _features:rpg.objects.GameFeatureObject[] = null;

    protected clearCache() {
      this._features = null;
      super.clearCache();
    }

    /*
     * Render the tile map, and any features it has.
     */
    renderFrame(elapsed:number) {
      if (!this._features) {
        this._features = <rpg.objects.GameFeatureObject[]>this.scene.objectsByType(rpg.objects.GameFeatureObject);
        this._renderables = this._renderables.concat(this._features);
      }
      super.renderFrame(elapsed);
      return this;
    }
  }
}

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

import {GameTileMap} from './gameTileMap';
import {GameFeatureObject} from './objects/gameFeatureObject';

export class RPGMapView extends pow2.game.GameMapView {
  tileMap:GameTileMap = null;

  private _features:GameFeatureObject[] = null;

  public viewTranslate:pow2.Point = new pow2.Point();

  protected clearCache() {
    this._features = null;
    super.clearCache();
  }

  //
  //setTileMap(tileMap:GameTileMap) {
  //  this.tileMap = tileMap;
  //  this.clearCache();
  //}

  setRenderState() {
    super.setRenderState();
    //this.context.translate(this.viewTranslate.x,this.viewTranslate.y);
  }

  /**
   * Render the tile map, and any features it has.
   */
  renderFrame(elapsed:number) {
    if (!this._features) {
      this._features = <GameFeatureObject[]>this.scene.objectsByType(GameFeatureObject);
      this._renderables = this._renderables.concat(this._features);
    }
    super.renderFrame(elapsed);
    return this;
  }
}

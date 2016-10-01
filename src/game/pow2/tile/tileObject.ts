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
import {ImageResource} from '../../pow-core/resources/image';
import {SpriteComponent} from './components/spriteComponent';
import {Scene} from '../scene/scene';
import {Point} from '../../pow-core/point';
import {MovableComponent} from '../scene/components/movableComponent';
import {SceneWorld} from '../scene/sceneWorld';
import {TileMap} from './tileMap';
import {SceneObject} from '../scene/sceneObject';
export interface TileObjectOptions {
  point?: Point;
  renderPoint?: Point;
  image?: HTMLImageElement;
  scale?: number;
  visible?: boolean;
  enabled?: boolean;
  tileMap: TileMap;

  // Game Sprite support.
  // ----------------------------------------------------------------------
  // The sprite name, e.g. "party.png" or "knight.png"
  icon?: string;
  // The sprite sheet source information
  meta?: any;
  // The sprite sheet frame (if applicable)
  frame?: number;
}

var DEFAULTS: TileObjectOptions = {
  visible: true,
  enabled: true,
  icon: "",
  scale: 1,
  image: null,
  tileMap: null
};

export class TileObject extends SceneObject implements TileObjectOptions {
  point: Point;
  renderPoint: Point;
  image: HTMLImageElement;
  visible: boolean;
  enabled: boolean;
  tileMap: TileMap;
  scale: number;
  icon: string;
  meta: any;
  frame: number;
  world: SceneWorld;

  constructor(options: TileObjectOptions = DEFAULTS) {
    super(options);
    _.extend(this, _.defaults(options || {}, DEFAULTS));
    return this;
  }

  setPoint(point: Point) {
    point.round();
    if (this.renderPoint) {
      this.renderPoint = point.clone();
    }
    this.point = point.clone();
    var moveComponent = <MovableComponent>
      this.findComponent(MovableComponent);
    if (moveComponent) {
      moveComponent.targetPoint.set(point);
      moveComponent.path.length = 0;
    }
  }

  /**
   * When added to a scene, resolve a feature icon to a renderable sprite.
   */
  onAddToScene(scene: Scene) {
    super.onAddToScene(scene);
    if (this.icon) {
      this.setSprite(this.icon);
    }
    if (!this.tileMap) {
      this.tileMap = <TileMap>this.scene.objectByType(TileMap);
    }
  }

  /**
   * Set the current sprite name.  Returns the previous sprite name.
   */
  setSprite(name: string, frame: number = 0): string {
    var oldSprite: string = this.icon;
    if (!name) {
      this.meta = null;
    }
    else {
      var meta = this.world.sprites.getSpriteMeta(name);
      this.world.sprites.getSpriteSheet(meta.source).then((image: ImageResource) => {
        this.meta = meta;
        return this.image = image.data;
      });
    }
    this.icon = name;
    return oldSprite;
  }

  getIcon() {
    if (this.icon) {
      return this.icon;
    }
    var spriteComponent = <SpriteComponent>this.findComponent(SpriteComponent);
    if (spriteComponent) {
      return spriteComponent.icon;
    }
    return null;
  }

}

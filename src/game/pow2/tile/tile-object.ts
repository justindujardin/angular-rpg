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
import {ImageResource} from '../../pow-core/resources/image.resource';
import {Scene} from '../scene/scene';
import {IPoint, Point} from '../../pow-core';
import {MovableBehavior} from '../scene/behaviors/movable-behavior';
import {GameWorld} from '../../../app/services/game-world';
import {TileMap} from './tile-map';
import {SceneObject} from '../scene/scene-object';
import {ISpriteMeta} from '../core/api';
import {EventEmitter} from '@angular/core';

export interface TileObjectOptions {
  point?: IPoint;
  renderPoint?: IPoint;
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

export const DEFAULTS: TileObjectOptions = {
  visible: true,
  enabled: true,
  icon: '',
  scale: 1,
  image: null,
  tileMap: null
};

export class TileObject extends SceneObject implements TileObjectOptions {
  point: IPoint;
  renderPoint: Point;
  image: HTMLImageElement;
  visible: boolean;
  enabled: boolean;
  tileMap: TileMap;
  world: GameWorld;
  scale: number;

  /** Emits when the object icon is changed */
  onChangeIcon: EventEmitter<string> = new EventEmitter<string>();

  private _icon: string;
  set icon(value: string) {
    this._updateIcon(value);
    this._icon = value;
  }

  get icon(): string {
    return this._icon;
  }

  meta: ISpriteMeta;
  frame: number = 0;

  constructor() {
    super({});
    _.extend(this, _.defaults({}, DEFAULTS));
    return this;
  }

  setPoint(point: IPoint) {
    const newPoint = new Point(point).round();
    if (this.renderPoint) {
      this.renderPoint = newPoint.clone();
    }
    this.point = newPoint.clone();
    const moveComponent = this.findBehavior(MovableBehavior) as MovableBehavior;
    if (moveComponent) {
      moveComponent.targetPoint.set(newPoint);
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
      this.tileMap = this.scene.objectByType(TileMap) as TileMap;
    }
  }

  /**
   * Set the current sprite name.  Returns the previous sprite name.
   * TODO: Refactor to async friendly method (promise?)
   */
  setSprite(name: string, frame: number = 0): string {
    const oldSprite: string = this.icon;
    if (!name) {
      this.meta = null;
    }
    if (this._icon !== name) {
      this.icon = name;
    }
    return oldSprite;
  }

  _updateIcon(icon: string) {
    const world = GameWorld.get();
    if (!world) {
      return;
    }
    const meta = world.sprites.getSpriteMeta(icon);
    if (meta) {
      world.sprites.getSpriteSheet(meta.source).then((images: ImageResource[]) => {
        const image = images[0];
        this.meta = meta;
        this.image = image.data;
        this.onChangeIcon.next(icon);
      });
    }
  }

}

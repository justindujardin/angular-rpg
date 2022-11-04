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
import { EventEmitter } from '@angular/core';
import { MovableBehavior } from '../behaviors/movable-behavior';
import { ImageResource, IPoint, Point } from '../core';
import { ISpriteMeta } from '../core/api';
import { assertTrue } from '../models/util';
import { GameWorld } from '../services/game-world';
import { Scene } from './scene';
import { SceneObject } from './scene-object';
import { TileMap } from './tile-map';

// TODO: Refactor to extend ITiledObject and update usage in code base (e.g. .point.x -> .x)
export interface TileObjectOptions {
  point?: IPoint;
  renderPoint?: IPoint;
  gid?: number;
  image: HTMLImageElement | null;
  scale?: number;
  visible?: boolean;
  enabled?: boolean;
  tileMap: TileMap | null;

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
  tileMap: null,
};

export class TileObject extends SceneObject implements TileObjectOptions {
  point: Point;
  renderPoint: Point;
  visible: boolean;
  enabled: boolean;
  tileMap: TileMap | null;
  world: GameWorld;
  scale: number;
  isEntered: boolean;

  /** The HTML img element for rendering the current icon/gid */
  image: HTMLImageElement | null;
  /** The sprite metadata for rendering the current icon/gid */
  meta: ISpriteMeta | null;
  /** The frame to use when rendering the sprite (if an animation) */
  frame: number = 0;

  /** An alternate sprite image to use when rendering this object. Overrides .meta when non-null */
  altMeta: ISpriteMeta | null;
  /** An alternate sprite image to use when rendering this object. Overrides .image when non-null */
  altImage: HTMLImageElement | null;
  /** An alternate icon to use when rendering this object. Overrides .icon when non-null. */
  altIcon: string | null;
  /** Emitted when a player has entered this tile */
  onEntered$ = new EventEmitter();
  /** Emitted when a player has exited this tile */
  onExited$ = new EventEmitter();
  /** Emits when the object icon is changed */
  onChangeIcon: EventEmitter<string> = new EventEmitter<string>();

  private _icon?: string;
  set icon(value: string | undefined) {
    this._updateIcon(value);
    this._icon = value;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  private _gid?: number;
  set gid(value: number | undefined) {
    this._gid = value;
    // Load a sprite from a given gid (Tile objects in Tiled)
    if (value !== undefined && this.tileMap) {
      const meta = this.tileMap.getTileMeta(value);
      if (meta) {
        this.setSprite(meta.image);
      }
    }
  }

  get gid(): number | undefined {
    return this._gid;
  }

  enter(object: TileObject): boolean {
    return true;
  }

  entered(object: TileObject) {
    this.onEntered$.emit(this);
    this.isEntered = true;
    return true;
  }

  exit(object: TileObject): boolean {
    return true;
  }

  exited(object: TileObject) {
    this.onExited$.emit(this);
    this.isEntered = false;
    return true;
  }
  setPoint(point: IPoint) {
    const newPoint = new Point(point).round();
    if (this.renderPoint) {
      this.renderPoint = newPoint.clone();
    }
    this.point = newPoint.clone();
    const moveComponent = this.findBehavior<MovableBehavior>(MovableBehavior);
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
    // Load a sprite given the source icon name
    if (this.icon) {
      this.setSprite(this.icon);
    }
    // Load a sprite from a given gid (Tile objects in Tiled)
    if (this.gid !== undefined) {
      const meta = this.tileMap?.getTileMeta(this.gid);
      if (meta) {
        this.setSprite(meta.image);
      }
    }
    if (!this.tileMap && this.scene) {
      this.tileMap = this.scene.objectByType<TileMap>(TileMap);
    }
  }

  /**
   * Specify and overriding sprite to use when rendering this object.
   * This is useful when you want to conditionally change the sprite's
   * appearance in the world.
   *
   * @param spriteName The sprite name to use
   * @returns
   */
  async useAltSprite(spriteName?: string) {
    const world = GameWorld.get();
    if (!spriteName || !world) {
      this.altImage = null;
      this.altMeta = null;
      this.altIcon = null;
      return;
    }
    const meta = world.sprites.getSpriteMeta(spriteName);
    assertTrue(meta, `useAltSprite: ${spriteName} has no valid metadata`);
    const images: ImageResource[] = await world.sprites.getSpriteSheet(meta.source);
    assertTrue(images.length === 1, `useAltSprite: no sheet meta '${meta.source}'`);
    const image = images[0];
    this.altMeta = meta;
    this.altIcon = spriteName;
    this.altImage = image.data;
  }

  /**
   * Set the current sprite name.  Returns the previous sprite name.
   * TODO: Refactor to async friendly method (promise?)
   */
  setSprite(name?: string, frame: number = 0): string | undefined {
    const oldSprite: string | undefined = this.icon;
    if (!name) {
      this.meta = null;
    }
    if (this._icon !== name) {
      this.icon = name;
    }
    return oldSprite;
  }

  async _updateIcon(icon?: string) {
    const world = GameWorld.get();
    if (!world || !icon) {
      this.image = null;
      return;
    }
    const meta = world.sprites.getSpriteMeta(icon);
    if (meta) {
      const images: ImageResource[] = await world.sprites.getSpriteSheet(meta.source);
      const image = images[0];
      this.meta = meta;
      this.image = image.data;
      this.onChangeIcon.next(icon);
    }
  }
}

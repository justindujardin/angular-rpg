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
import {IMoveDescription, MovableBehavior} from '../../game/pow2/scene/behaviors/movable-behavior';
import {TileObject} from '../../game/pow2/tile/tile-object';
import {Point} from '../../game/pow-core/point';
import {Headings, PlayerRenderBehaviorComponent} from '../routes/world/behaviors/player-render.behavior';
import {TileObjectBehavior} from '../../game/pow2/tile/tile-object-behavior';
import {TileMap} from '../../game/pow2/tile/tile-map';
import {ITiledLayer} from '../../game/pow-core/resources/tiled/tiled.model';
import {SceneObject} from '../../game/pow2/scene/scene-object';

export class BasePlayerComponent extends MovableBehavior {
  host: TileObject;
  passableKeys: string[] = ['passable'];
  // TODO: Pass in collide types during entity creation, and assert on invalid types.
  static COLLIDE_TYPES: string[] = [
    'TempleFeatureComponent',
    'StoreFeatureComponent',
    'DialogFeatureComponent',
    'sign'
  ];
  private _lastFrame: number = 3;
  private _renderFrame: number = 3;
  heading: Point = new Point(0, -1);
  sprite: PlayerRenderBehaviorComponent = null;
  collideComponentType: any = TileObjectBehavior;

  static Events: any = {
    MOVE_BEGIN: 'move:begin',
    MOVE_END: 'move:end'
  };

  syncBehavior(): boolean {
    this.sprite = <PlayerRenderBehaviorComponent>
      this.host.findBehavior(PlayerRenderBehaviorComponent);
    return super.syncBehavior();
  }

  tick(elapsed: number) {
    // There are four states and two rows.  The second row is all alt states, so mod it out
    // when a move ends.
    this._lastFrame = this._renderFrame > 3 ? this._renderFrame - 4 : this._renderFrame;
    super.tick(elapsed);
  }

  interpolateTick(elapsed: number) {
    super.interpolateTick(elapsed);
    if (!this.sprite) {
      return;
    }
    const xMove = this.targetPoint.x !== this.host.renderPoint.x;
    const yMove = this.targetPoint.y !== this.host.renderPoint.y;
    if (this.velocity.y > 0 && yMove) {
      this.sprite.setHeading(Headings.SOUTH, yMove);
      this.heading.set(0, 1);
    }
    else if (this.velocity.y < 0 && yMove) {
      this.sprite.setHeading(Headings.NORTH, yMove);
      this.heading.set(0, -1);
    }
    else if (this.velocity.x < 0 && xMove) {
      this.sprite.setHeading(Headings.WEST, xMove);
      this.heading.set(-1, 0);
    }
    else if (this.velocity.x > 0 && xMove) {
      this.sprite.setHeading(Headings.EAST, xMove);
      this.heading.set(1, 0);
    }
    else {
      if (this.velocity.y > 0) {
        this.sprite.setHeading(Headings.SOUTH, false);
        this.heading.set(0, 1);
      }
      else if (this.velocity.y < 0) {
        this.sprite.setHeading(Headings.NORTH, false);
        this.heading.set(0, -1);
      }
      else if (this.velocity.x < 0) {
        this.sprite.setHeading(Headings.WEST, false);
        this.heading.set(-1, 0);
      }
      else if (this.velocity.x > 0) {
        this.sprite.setHeading(Headings.EAST, false);
        this.heading.set(1, 0);
      }
      else {
        this.sprite.setMoving(false);
      }
    }
  }

  /**
   * Determine if a point on the map collides with a given terrain
   * attribute.  If the attribute is set to false, a collision occurs.
   *
   * @param at {Point} The point to check.
   * @param passableAttribute {string} The attribute to check.
   * @returns {boolean} True if the passable attribute was found and set to false.
   */
  collideWithMap(at: Point, passableAttribute: string): boolean {
    let map = <TileMap> this.host.scene.objectByType(TileMap);
    if (map) {
      const layers: ITiledLayer[] = map.getLayers();
      for (let i = 0; i < layers.length; i++) {
        const terrain = map.getTileData(layers[i], at.x, at.y);
        if (!terrain) {
          continue;
        }
        if (terrain[passableAttribute] === false) {
          return true;
        }
      }
    }
    return false;
  }

  collideMove(x: number, y: number, results: SceneObject[] = []) {
    return false;
  }

  beginMove(move: IMoveDescription) {
    let comp: TileObjectBehavior;
    let o: TileObject;
    let i;
    this.host.trigger(BasePlayerComponent.Events.MOVE_BEGIN, this, move.from, move.to);
    if (!this.collider) {
      return;
    }

    const results = [];
    this.collider.collide(move.from.x, move.from.y, TileObject, results);
    for (i = 0; i < results.length; i++) {
      o = results[i];
      comp = <TileObjectBehavior> o.findBehavior(this.collideComponentType);
      if (!comp || !comp.enter) {
        continue;
      }
      if (comp.exit(this.host) === false) {
        return;
      }
    }
    results.length = 0;
    this.collider.collide(move.to.x, move.to.y, TileObject, results);
    for (i = 0; i < results.length; i++) {
      o = results[i];
      comp = <TileObjectBehavior> o.findBehavior(this.collideComponentType);
      if (!comp || !comp.enter) {
        continue;
      }
      if (comp.enter(this.host) === false) {
        return;
      }
    }
  }

  // TODO: Refactor this to have a set of outputs for moving, and delegate the entered/exit logic
  //       to the world-map entity.
  completeMove(move: IMoveDescription) {
    let comp;
    this.host.trigger(BasePlayerComponent.Events.MOVE_END, this, move.from, move.to);
    if (!this.collider) {
      return;
    }

    // Trigger exit on previous components
    const hits: TileObject[] = [];
    this.collider.collide(move.from.x, move.from.y, TileObject, hits);
    const fromObject: TileObject = _.find(hits, (o: TileObject) => {
      return o._uid !== this.host._uid;
    });
    if (fromObject) {
      comp = <TileObjectBehavior> fromObject.findBehavior(this.collideComponentType);
      if (comp && comp.host._uid !== this.host._uid) {
        comp.exited(this.host);
      }
    }

    // Trigger enter on new components
    hits.length = 0;
    this.collider.collide(move.to.x, move.to.y, TileObject, hits);
    const toObject: TileObject = _.find(hits, (o: TileObject) => {
      return o._uid !== this.host._uid;
    });
    if (toObject) {
      comp = <TileObjectBehavior> toObject.findBehavior(this.collideComponentType);
      if (comp && comp.host._uid !== this.host._uid) {
        comp.entered(this.host);
      }
    }

  }
}

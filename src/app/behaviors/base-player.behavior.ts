import { EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import { Point } from '../../app/core/point';
import { ITiledLayer } from '../../app/core/resources/tiled/tiled.model';
import {
  Headings,
  PlayerRenderBehaviorComponent,
} from '../routes/world/behaviors/player-render.behavior';
import { SceneObject } from '../scene/scene-object';
import { TileMap } from '../scene/tile-map';
import { TileObject } from '../scene/tile-object';
import { IMoveDescription, MovableBehavior } from './movable-behavior';
import { TileObjectBehavior } from './tile-object-behavior';

/** A player move event */
export interface PlayerMoveEvent {
  from: Point;
  to: Point;
  behavior: BasePlayerComponent;
}

export class BasePlayerComponent extends MovableBehavior {
  /** Emitted when a move is beginning */
  onMoveBegin$ = new EventEmitter<PlayerMoveEvent>();
  /** Emitted when a move is completed */
  onMoveEnd$ = new EventEmitter<PlayerMoveEvent>();

  host: TileObject;
  passableKeys: string[] = ['passable'];
  heading: Point = new Point(0, -1);
  sprite: PlayerRenderBehaviorComponent | null = null;
  collideComponentType: any = TileObjectBehavior;

  syncBehavior(): boolean {
    this.sprite = this.host.findBehavior<PlayerRenderBehaviorComponent>(
      PlayerRenderBehaviorComponent,
    );
    return super.syncBehavior();
  }

  tick(elapsed: number): void {
    super.tick(elapsed);
  }

  interpolateTick(elapsed: number): void {
    super.interpolateTick(elapsed);
    if (!this.sprite) {
      return;
    }
    const xMove = this.targetPoint.x !== this.host.renderPoint.x;
    const yMove = this.targetPoint.y !== this.host.renderPoint.y;
    if (this.velocity.y > 0 && yMove) {
      this.sprite.setHeading(Headings.SOUTH, yMove);
      this.heading.set(0, 1);
    } else if (this.velocity.y < 0 && yMove) {
      this.sprite.setHeading(Headings.NORTH, yMove);
      this.heading.set(0, -1);
    } else if (this.velocity.x < 0 && xMove) {
      this.sprite.setHeading(Headings.WEST, xMove);
      this.heading.set(-1, 0);
    } else if (this.velocity.x > 0 && xMove) {
      this.sprite.setHeading(Headings.EAST, xMove);
      this.heading.set(1, 0);
    } else {
      if (this.velocity.y > 0) {
        this.sprite.setHeading(Headings.SOUTH, false);
        this.heading.set(0, 1);
      } else if (this.velocity.y < 0) {
        this.sprite.setHeading(Headings.NORTH, false);
        this.heading.set(0, -1);
      } else if (this.velocity.x < 0) {
        this.sprite.setHeading(Headings.WEST, false);
        this.heading.set(-1, 0);
      } else if (this.velocity.x > 0) {
        this.sprite.setHeading(Headings.EAST, false);
        this.heading.set(1, 0);
      } else {
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
    let map = this.host.scene?.objectByType<TileMap>(TileMap);
    if (map) {
      const layers: ITiledLayer[] = map.getLayers();
      for (let i = 0; i < layers.length; i++) {
        const terrain = map.getTileData(layers[i], at.x, at.y);
        if (!terrain) {
          continue;
        }
        if (terrain.properties && terrain.properties[passableAttribute] === false) {
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
    let comp: TileObjectBehavior | null = null;
    let o: TileObject;
    let i;
    this.onMoveBegin$.emit({ behavior: this, from: move.from, to: move.to });
    if (!this.collider) {
      return;
    }

    const results: TileObject[] = [];
    this.collider.collide(move.from.x, move.from.y, TileObject, results);
    for (i = 0; i < results.length; i++) {
      o = results[i];
      comp = o.findBehavior<TileObjectBehavior>(this.collideComponentType);
      if (o.exit(this.host) === false) {
        return;
      }
      if (!comp || !comp.exit) {
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
      comp = o.findBehavior<TileObjectBehavior>(this.collideComponentType);
      if (o.enter(this.host) === false) {
        return;
      }
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
    this.onMoveEnd$.emit({ behavior: this, from: move.from, to: move.to });
    if (!this.collider) {
      return;
    }

    // Trigger exit on previous components
    const hits: TileObject[] = [];
    this.collider.collide(move.from.x, move.from.y, TileObject, hits);
    const fromObject: TileObject | undefined = _.find(hits, (o: TileObject) => {
      return o._uid !== this.host._uid;
    });
    if (fromObject) {
      comp = fromObject.findBehavior<TileObjectBehavior>(this.collideComponentType);
      if (comp?.host?._uid && comp?.host?._uid !== this.host._uid) {
        comp.exited(this.host);
      } else {
        fromObject.exited(this.host);
      }
    }

    // Trigger enter on new components
    hits.length = 0;
    this.collider.collide(move.to.x, move.to.y, TileObject, hits);
    const toObject: TileObject | undefined = _.find(hits, (o: TileObject) => {
      return o._uid !== this.host._uid;
    });
    if (toObject) {
      comp = toObject.findBehavior<TileObjectBehavior>(this.collideComponentType);
      if (comp?.host?._uid && comp?.host?._uid !== this.host._uid) {
        comp.entered(this.host);
      } else {
        toObject.entered(this.host);
      }
    }
  }
}

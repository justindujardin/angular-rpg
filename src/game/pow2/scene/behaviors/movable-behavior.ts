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
import {Point} from '../../../pow-core/point';
import {TickedBehavior} from './ticked-behavior';
import {KeyCode} from '../../core/input';
import {SceneObject} from '../scene-object';
import {CollisionBehaviorComponent} from '../../../../app/behaviors/collision.behavior';
/**
 * Describe a move from one point to another.
 */
export interface IMoveDescription {
  from: Point;
  to: Point;
}

/**
 * Add movable behavior to an object.  Supports moving in X/Y directions, one
 * at a time.  Good for 2D tile games.
 */
export class MovableBehavior extends TickedBehavior {
  _elapsed: number = 0;
  targetPoint: Point;
  path: Point[] = [];
  tickRateMS: number = 250;
  velocity: Point = new Point(0, 0);
  workPoint: Point = new Point(0, 0);
  host: SceneObject;
  collider: CollisionBehaviorComponent;
  currentMove: IMoveDescription = null;

  connectBehavior(): boolean {
    this.host.point = new Point(this.host.point).round();
    this.targetPoint = new Point(this.host.point);
    this.host.renderPoint = this.targetPoint.clone();
    return super.connectBehavior();
  }

  syncBehavior(): boolean {
    this.collider = this.host.findBehavior(CollisionBehaviorComponent) as CollisionBehaviorComponent;
    return super.syncBehavior();
  }

  /**
   * Called when a new tick of movement begins.
   * @param move The move that is beginning
   */
  beginMove(move: IMoveDescription) {
    // nothing
  }

  /**
   * Called when a complete tick of movement occurs.
   * @param move The move that is now completed.
   */
  completeMove(move: IMoveDescription) {
    // nothing
  }

  collideMove(x: number, y: number, results: SceneObject[] = []) {
    if (!this.collider) {
      return false;
    }
    return this.collider.collide(x, y, SceneObject, results);
  }

  updateVelocity() {
    if (!this.host.scene || !this.host.scene.world || !this.host.scene.world.input) {
      return;
    }
    const worldInput = <any> this.host.scene.world.input;
    // Keyboard input
    this.velocity.x = 0;
    if (worldInput.keyDown(KeyCode.LEFT)) {
      this.velocity.x -= 1;
    }
    if (worldInput.keyDown(KeyCode.RIGHT)) {
      this.velocity.x += 1;
    }
    this.velocity.y = 0;
    if (worldInput.keyDown(KeyCode.UP)) {
      this.velocity.y -= 1;
    }
    if (worldInput.keyDown(KeyCode.DOWN)) {
      this.velocity.y += 1;
    }
  }

  interpolateTick(elapsed: number) {
    // Interpolate position based on tickrate and elapsed time
    const factor = this._elapsed / this.tickRateMS;
    this.host.renderPoint.x = this.host.point.x;
    this.host.renderPoint.y = this.host.point.y;
    if (this.velocity.isZero()) {
      return;
    }
    Point.interpolate(this.host.renderPoint, this.host.point, this.targetPoint, factor);
    this.host.renderPoint.x = parseFloat(this.host.renderPoint.x.toFixed(2));
    this.host.renderPoint.y = parseFloat(this.host.renderPoint.y.toFixed(2));
  }

  tick(elapsed: number) {
    this._elapsed += elapsed;
    if (this._elapsed < this.tickRateMS) {
      return;
    }
    // Don't subtract elapsed here, but take the modulus so that
    // if for some reason we get a HUGE elapsed, it just does one
    // tick and keeps the remainder toward the next.
    this._elapsed = this._elapsed % this.tickRateMS;

    // Advance the object if it can be advanced.
    //
    // Check that targetPoint != point first, because or else
    // the collision check will see be against the current position.
    if (!this.targetPoint.equal(this.host.point) && !this.collideMove(this.targetPoint.x, this.targetPoint.y)) {

      // Target point is not the current point and there is no collision.
      this.workPoint.set(this.host.point);
      this.host.point.x = this.targetPoint.x;
      this.host.point.y = this.targetPoint.y;

      // Can happen sometimes when loading a game on board a ship then immediate disembarking
      if (!this.currentMove) {
        this.currentMove = {
          from: new Point(this.host.point),
          to: new Point(this.targetPoint)
        };
      }
      //
      this.completeMove(this.currentMove);
    }

    // Update Velocity Inputs
    this.updateVelocity();

    this.targetPoint.set(this.host.point);

    const zero: boolean = this.velocity.isZero();
    if (zero && this.path.length === 0) {
      return;
    }

    // Zero and have a path, shift the next tile and move there.
    if (zero) {
      const next: Point = this.path.shift();
      this.velocity.set(next.x - this.host.point.x, next.y - this.host.point.y);
    }
    else {
      // Clear path is moving manually.
      this.path.length = 0;
    }
    this.targetPoint.add(this.velocity);
    // Check to see if both axes can advance by simply going to the
    // target point.

    // Determine which axis we can move along
    if (this.velocity.y !== 0 && !this.collideMove(this.host.point.x, this.targetPoint.y)) {
      this.targetPoint.x = this.host.point.x;
    }
    // How about the X axis?  We'll take any axis we can get.
    else if (this.velocity.x !== 0 && !this.collideMove(this.targetPoint.x, this.host.point.y)) {
      this.targetPoint.y = this.host.point.y;
    }
    else {
      // Nope, collisions in all directions, just reset the target point
      this.targetPoint.set(this.host.point);
      // If there's a path, it had an invalid move, so clear it.
      this.path.length = 0;
      return;
    }

    this.currentMove = {
      from: new Point(this.host.point),
      to: new Point(this.targetPoint)
    };
    this.beginMove(this.currentMove);
  }
}

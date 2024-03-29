import { Component, EventEmitter, Output } from '@angular/core';
import { CollisionBehaviorComponent } from '../../../behaviors/collision.behavior';
import { TickedBehavior } from '../../../behaviors/ticked-behavior';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { TileObject } from '../../../scene/tile-object';
import { MapFeatureComponent } from '../map-feature.component';
import { PlayerBehaviorComponent } from './player-behavior';

/**
 * A Component that collides with features that are directly in front
 * of a player, and fires enter/leave events for them.
 */
@Component({
  selector: 'player-look-behavior',
  template: `<ng-content></ng-content>`,
})
export class PlayerTriggerBehaviorComponent extends TickedBehavior {
  host: TileObject;
  collider: CollisionBehaviorComponent | null = null;
  player: PlayerBehaviorComponent | null = null;

  private featureObject: MapFeatureComponent | null = null;

  /**
   * The player has touched a game feature.
   */
  @Output() onLook: EventEmitter<MapFeatureComponent> = new EventEmitter();

  /**
   * The player was touching a game feature, and is now leaving.
   */
  @Output() onLookAway: EventEmitter<MapFeatureComponent> = new EventEmitter();

  syncBehavior(): boolean {
    super.syncBehavior();
    this.player = this.host.findBehavior(
      PlayerBehaviorComponent,
    ) as PlayerBehaviorComponent;
    this.collider = this.host.findBehavior(
      CollisionBehaviorComponent,
    ) as CollisionBehaviorComponent;
    return !!(this.player && this.collider);
  }

  tick(elapsed: number) {
    super.tick(elapsed);
    if (!this.player || !this.collider) {
      return;
    }
    const results: MapFeatureComponent[] = [];
    const headingX: number = this.host.point.x + this.player.heading.x;
    const headingY: number = this.host.point.y + this.player.heading.y;
    const isTouching: boolean = this.collider.collide(
      headingX,
      headingY,
      GameFeatureObject,
      results,
    );
    const touched = results[0];
    const currentTouchId: string | null = this.featureObject?._uid || null;
    const touchChanged: boolean = !!(touched && touched._uid !== currentTouchId);
    // No collisions for this tick
    if (!isTouching || !touched || touchChanged) {
      // If we were previously colliding with a feature, trigger the leave output.
      if (this.featureObject) {
        this.onLookAway.emit(this.featureObject);
        // And clean up the reference so we don't fire the event more than once
        this.featureObject = null;
      }
    }

    // Colliding with a feature
    if (touched && isTouching) {
      this.featureObject = touched;
      if (touchChanged) {
        this.onLook.emit(this.featureObject);
      }
    }
  }
}

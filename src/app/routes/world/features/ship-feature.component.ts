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
import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first } from 'rxjs/operators';
import { Point } from '../../../core';
import { GameStateBoardShipAction } from '../../../models/game-state/game-state.actions';
import { PointRecord } from '../../../models/records';
import { getGameBoardedShip, getGameShipPosition } from '../../../models/selectors';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { TileObject } from '../../../scene/tile-object';
import { PlayerBehaviorComponent } from '../behaviors/player-behavior';
import { MapFeatureComponent } from '../map-feature.component';

@Component({
  selector: 'ship-feature',
  template: '<ng-content></ng-content>',
})
export class ShipFeatureComponent
  extends MapFeatureComponent
  implements OnDestroy, AfterViewInit
{
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._subscription?.unsubscribe();
    this._subscription = null;
    clearInterval(this._tickInterval);
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    // Check for boarded state when the feature is initialized.
    this._subscription = this.store
      .select(getGameShipPosition)
      .pipe(distinctUntilChanged())
      .subscribe((p: PointRecord) => {
        this.setPoint({ x: p.x, y: p.y });
      });

    this.store
      .select(getGameBoardedShip)
      .pipe(debounceTime(100), first())
      .subscribe((boarded: boolean) => {
        if (boarded && this.scene) {
          const playerHost = this.scene.objectByComponent(
            PlayerBehaviorComponent
          ) as GameFeatureObject;
          if (playerHost) {
            this.enter(playerHost);
            this.entered(playerHost);
          }
        }
      });
  }
  party: PlayerBehaviorComponent | null;
  partyObject: TileObject | null;
  partySprite: string;
  private _tickInterval: any = -1;
  // @ts-ignore
  @Input() feature: ITiledObject | null;

  private _subscription: Subscription | null = null;

  enter(object: GameFeatureObject): boolean {
    // Only a player can board a ship
    this.party = object.findBehavior<PlayerBehaviorComponent>(PlayerBehaviorComponent);
    if (!this.party) {
      return false;
    }
    this.partySprite = object.icon || '';
    this.party.passableKeys = ['shipPassable'];
    return true;
  }

  entered(object: GameFeatureObject): boolean {
    return this.board(object);
  }

  /**
   * Board an object onto the ship component.  This will modify the
   * @param object
   */
  board(object: GameFeatureObject): boolean {
    if (this.partyObject || !this.party) {
      return false;
    }
    this.store.dispatch(new GameStateBoardShipAction(true));
    this.partyObject = object;
    this.visible = false;
    this.enabled = false;
    object.setSprite(this.icon, 0);
    clearInterval(this._tickInterval);
    this._tickInterval = setInterval(() => {
      if (!this.party || !this.partyObject) {
        return;
      }
      const partyTarget = Point.equal(this.partyObject.point, this.party.targetPoint);
      if (partyTarget && !this.party.heading.isZero()) {
        const from: Point = new Point(this.partyObject.point);
        const to: Point = from.clone().add(this.party.heading);
        if (
          !this.party.collideWithMap(from, 'shipPassable') &&
          !this.party.collideWithMap(to, 'passable')
        ) {
          this.disembark(from, to, this.party.heading.clone());
        }
      }
    }, 32);
    return true;
  }

  disembark(from: Point, to: Point, heading: Point) {
    clearInterval(this._tickInterval);
    if (this.partyObject) {
      this.partyObject.setSprite(this.partySprite);
    }
    if (this.party) {
      this.party.targetPoint.set(to);
      this.party.velocity.set(heading);
      this.party.passableKeys = ['passable'];
    }
    this.point.x = from.x;
    this.point.y = from.y;
    this.visible = true;
    this.enabled = true;
    this.partyObject = null;
    this.party = null;
    this.store.dispatch(new GameStateBoardShipAction(false));
    // this.store.dispatch(new GameStateMoveAction(to));
  }
}

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
import {TileObject} from '../../../../../game/pow2/tile/tile-object';
import {Subscription} from 'rxjs';
import {getGameBoardedShip, getGameShipPosition} from '../../../../models/selectors';
import {Point} from '../../../../../game/pow-core/point';
import {MapFeatureComponent, TiledFeatureComponent, TiledMapFeatureData} from '../map-feature.component';
import {GameFeatureObject} from '../../../../scene/game-feature-object';
import {PlayerBehaviorComponent} from '../../behaviors/player-behavior';
import {GameStateBoardShipAction} from '../../../../models/game-state/game-state.actions';
import {AfterViewInit, Component, Host, Input, OnDestroy} from '@angular/core';
import {AppState} from '../../../../app.model';
import {Store} from '@ngrx/store';
import {PointRecord} from '../../../../models/records';
@Component({
  selector: 'ship-feature',
  template: '<ng-content></ng-content>'
})
export class ShipFeatureComponent extends TiledFeatureComponent implements OnDestroy, AfterViewInit {
  ngOnDestroy(): void {
    // nope
  }

  ngAfterViewInit(): void {
    // Check for boarded state when the feature is initialized.
    this.store.select(getGameBoardedShip)
      .debounceTime(100)
      .first().subscribe((boarded: boolean) => {
      if (boarded && this.mapFeature.scene) {
        const playerHost = this.mapFeature.scene.objectByComponent(PlayerBehaviorComponent) as GameFeatureObject;
        if (playerHost) {
          this.enter(playerHost);
          this.entered(playerHost);
        }
      }
    });

  }
  party: PlayerBehaviorComponent;
  partyObject: TileObject;
  partySprite: string;
  private _tickInterval: any = -1;
  @Input() feature: TiledMapFeatureData;

  private _subscription: Subscription = null;

  constructor(
    private store: Store<AppState>,
    @Host() private mapFeature: MapFeatureComponent) {
    super();
  }

  disconnectBehavior(): boolean {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
    return true;
  }

  connectBehavior(): boolean {
    if (!super.connectBehavior()) {
      return false;
    }
    this._subscription = this.store.select(getGameShipPosition)
      .distinctUntilChanged()
      .subscribe((p: PointRecord) => {
        this.host.setPoint({x: p.x, y: p.y});
      });

    return true;
  }

  enter(object: GameFeatureObject): boolean {
    // Only a player can board a ship
    this.party = object.findBehavior(PlayerBehaviorComponent) as PlayerBehaviorComponent;
    if (!this.party) {
      return false;
    }
    this.partySprite = object.icon;
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
    this.host.visible = false;
    this.host.enabled = false;
    object.setSprite(this.host.icon, 0);
    this._tickInterval = setInterval(() => {
      if (Point.equal(this.partyObject.point, this.party.targetPoint) && !this.party.heading.isZero()) {
        const from: Point = new Point(this.partyObject.point);
        const to: Point = from.clone().add(this.party.heading);
        if (!this.party.collideWithMap(from, 'shipPassable') && !this.party.collideWithMap(to, 'passable')) {
          this.disembark(from, to, this.party.heading.clone());
        }
      }
    }, 32);
    return true;
  }

  disembark(from: Point, to: Point, heading: Point) {
    clearInterval(this._tickInterval);
    this.partyObject.setSprite(this.partySprite);
    this.party.targetPoint.set(to);
    this.party.velocity.set(heading);
    this.party.passableKeys = ['passable'];
    this.host.point.x = from.x;
    this.host.point.y = from.y;
    this.host.visible = true;
    this.host.enabled = true;
    this.partyObject = null;
    this.party = null;
    this.store.dispatch(new GameStateBoardShipAction(false));
    // this.store.dispatch(new GameStateMoveAction(to));
  }
}

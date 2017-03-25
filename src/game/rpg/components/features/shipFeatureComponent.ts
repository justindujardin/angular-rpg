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
import {GameFeatureComponent} from '../gameFeatureComponent';
import {GameFeatureObject} from '../../objects/gameFeatureObject';
import {GameStateModel} from '../../models/gameStateModel';
import {PlayerComponent} from '../playerComponent';
import {TileObject} from '../../../pow2/tile/tileObject';
import {Point} from '../../../pow-core/point';
import {Subscription} from 'rxjs';
import {IPoint} from '../../../pow-core';
import {GameStateSetKeyDataAction} from '../../../../app/models/game-state/game-state.actions';
import {getGameShipPosition} from '../../../../app/models/selectors';

export class ShipFeatureComponent extends GameFeatureComponent {
  party: PlayerComponent;
  partyObject: TileObject;
  partySprite: string;
  private _tickInterval: any = -1;

  private _subscription: Subscription = null;

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
    const gameWorld = this.host.world;
    if (gameWorld) {
      this._subscription = this.host.world.store.select(getGameShipPosition)
        .distinctUntilChanged()
        .subscribe((p: IPoint) => {
          this.host.setPoint(p);
        });
    }
    return true;
  }

  enter(object: GameFeatureObject): boolean {
    // Must have a entity component to board a ship.  Don't want buildings
    // and NPCs boarding ships... or do we?  [maniacal laugh]
    this.party = object.findBehavior(PlayerComponent) as PlayerComponent;
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
    this.partyObject = object;
    object.setSprite(this.host.icon);
    this.host.visible = false;
    this.host.enabled = false;

    this._tickInterval = setInterval(() => {
      if (this.partyObject.point.equal(this.party.targetPoint) && !this.party.heading.isZero()) {
        const from: Point = this.partyObject.point;
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
    this.host.point.set(from);
    this.host.visible = true;
    this.host.enabled = true;
    this.partyObject = null;
    this.party = null;
    this.host.world.store.dispatch(new GameStateSetKeyDataAction('shipPosition', this.host.point));
  }
}

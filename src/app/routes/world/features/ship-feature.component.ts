
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first } from 'rxjs/operators';
import { Point } from '../../../core';
import { GameStateBoardShipAction } from '../../../models/game-state/game-state.actions';
import { PointRecord } from '../../../models/records';
import { getGameBoardedShip, getGameShipPosition } from '../../../models/selectors';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { TileObject } from '../../../scene/tile-object';
import { PlayerBehaviorComponent } from '../behaviors/player-behavior';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface IShipFeatureProperties extends IMapFeatureProperties {}

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
    this.destroy();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    // Update this object when the ship position changes
    this._subscription = this.store
      .select(getGameShipPosition)
      .pipe(distinctUntilChanged())
      .subscribe((p: PointRecord) => {
        this.setPoint({ x: p.x, y: p.y });
      });

    // Check for boarded state when the feature is initialized.
    this.store
      .select(getGameBoardedShip)
      .pipe(debounceTime(50), first())
      .subscribe((boarded: boolean) => {
        if (boarded && this.scene) {
          const playerObj = this.scene.objectByComponent<GameFeatureObject>(
            PlayerBehaviorComponent
          );
          if (playerObj) {
            this.enter(playerObj);
            this.entered(playerObj);
          }
        }
      });
  }
  party: PlayerBehaviorComponent | null;
  partyObject: TileObject | null;
  boarded: boolean = false;

  private _subscription: Subscription | null = null;

  enter(object: GameFeatureObject): boolean {
    // Only a player can board a ship
    this.party = object.findBehavior<PlayerBehaviorComponent>(PlayerBehaviorComponent);
    if (!this.party) {
      return false;
    }
    this.party.passableKeys = ['shipPassable'];
    return true;
  }

  entered(object: GameFeatureObject): boolean {
    return this.board(object);
  }

  tick(elapsed: number) {
    if (!this.party || !this.partyObject) {
      return;
    }
    let shouldDisembark = false;
    const partyTarget = Point.equal(this.partyObject.point, this.party.targetPoint);
    if (partyTarget && !this.party.heading.isZero() && !this.party.velocity.isZero()) {
      const from: Point = new Point(this.partyObject.point);
      const to: Point = from.clone().add(this.party.heading);
      if (
        !this.party.collideWithMap(from, 'shipPassable') &&
        !this.party.collideWithMap(to, 'passable')
      ) {
        shouldDisembark = true;
      }
    }
    if (shouldDisembark) {
      const to = this.partyObject.point.clone().add(this.party.heading);
      this.disembark(to, this.party.heading);
      return;
    }
  }

  /**
   * Board an object onto the ship component.
   */
  board(object: GameFeatureObject): boolean {
    if (this.partyObject || !this.party) {
      return false;
    }
    this.store.dispatch(new GameStateBoardShipAction(true));
    this.visible = false;
    this.enabled = false;
    this.partyObject = object;
    this.boarded = true;
    this.partyObject.useAltSprite(this.icon);
    return true;
  }

  disembark(to: Point, heading: Point) {
    if (this.party) {
      this.party.targetPoint.set(to);
      this.party.velocity.set(heading);
      this.party.passableKeys = ['passable'];
    }
    if (this.partyObject) {
      this.partyObject.useAltSprite();
    }
    this.boarded = false;
    this.visible = true;
    this.enabled = true;
    this.partyObject = null;
    this.party = null;
    this.store.dispatch(new GameStateBoardShipAction(false));
  }
}

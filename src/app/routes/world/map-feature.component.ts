import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState } from '../../app.model';
import { NotificationService } from '../../components/notification/notification.service';
import { ITiledObject } from '../../core/resources/tiled/tiled.model';
import { assertTrue } from '../../models/util';
import { GameFeatureObject } from '../../scene/objects/game-feature-object';
import { Scene } from '../../scene/scene';
import { TileMap } from '../../scene/tile-map';
import { TileObject } from '../../scene/tile-object';
import { GameWorld } from '../../services/game-world';
import { RPGGame } from '../../services/rpg-game';

/**
 * An enumeration of the serialized names used to refer to map feature map from within a TMX file
 */
export type TiledMapFeatureTypes =
  | 'BlockFeatureComponent'
  | 'PortalFeatureComponent'
  | 'CombatFeatureComponent'
  | 'ShipFeatureComponent'
  | 'TreasureFeatureComponent'
  | 'DoorFeatureComponent'
  | 'DialogFeatureComponent'
  | 'StoreFeatureComponent'
  | 'ArmorsStoreFeatureComponent'
  | 'ItemsStoreFeatureComponent'
  | 'MagicsStoreFeatureComponent'
  | 'WeaponsStoreFeatureComponent'
  | 'TempleFeatureComponent';

/**
 * A component that defines the functionality of a map feature.
 */
@Component({
  selector: 'map-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
})
export class MapFeatureComponent
  extends GameFeatureObject
  implements AfterViewInit, OnDestroy
{
  @Input() tileMap: TileMap;
  @Input() scene: Scene;
  @Output() onClose: EventEmitter<MapFeatureComponent> = new EventEmitter();

  /**
   * Write-only feature input.
   */
  @Input() feature: ITiledObject | null = null;
  /**
   * Observable of feature data.
   */
  feature$: Observable<ITiledObject | null> = this._feature$;

  protected assertFeature() {
    if (!this.feature?.properties) {
      throw new Error(`feature(${this.feature?.name}) lacks valid data or properties`);
    }
  }

  private _active$ = new BehaviorSubject<boolean>(false);
  active$: Observable<boolean> = this._active$;

  set active(value: boolean) {
    this._active$.next(value);
  }
  get active(): boolean {
    return this._active$.value;
  }

  enter(object: TileObject): boolean {
    this.assertFeature();
    this.active = true;
    return true;
  }

  exit(object: TileObject): boolean {
    this.assertFeature();
    this.active = false;
    return true;
  }

  constructor(
    public store: Store<AppState>,
    public notify: NotificationService,
    public game: RPGGame
  ) {
    super(null, null);
  }

  ngAfterViewInit(): void {
    if (this.scene) {
      this.scene.addObject(this);
    }
    if (this.feature) {
      this.setFeature(this.feature);
    }
    const world = GameWorld.get();
    assertTrue(world, 'invalid game world');
    world.mark(this);
  }

  ngOnDestroy(): void {
    const world = GameWorld.get();
    assertTrue(world, 'invalid world');
    world.erase(this);
    this.destroy();
    if (this.scene) {
      this.scene.removeObject(this);
    }
  }
}

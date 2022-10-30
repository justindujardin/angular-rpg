import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription,
} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AppState } from '../../../app.model';
import { TileObjectBehavior } from '../../../behaviors/tile-object-behavior';
import { TiledTMXResource } from '../../../core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { getGameKey, getGameKeyData } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { Scene } from '../../../scene/scene';
import { TileMap } from '../../../scene/tile-map';
import { TileObject } from '../../../scene/tile-object';
import { GameWorld } from '../../../services/game-world';

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

export type TiledMapFeatureData<PropertiesType = any> = ITiledObject<PropertiesType>;

export class TiledFeatureComponent<
  T extends TiledMapFeatureData = TiledMapFeatureData
> extends TileObjectBehavior {
  host: GameFeatureObject;

  /**
   * Write-only feature input.
   */
  set feature(value: T | null) {
    this._feature$.next(value);
  }
  get feature(): T | null {
    return this._feature$.value;
  }

  protected _feature$: BehaviorSubject<T | null> = new BehaviorSubject(null);

  /**
   * Observable of feature data.
   */
  feature$: Observable<TiledMapFeatureData | null> = this._feature$;

  get properties(): any {
    return this._feature$.value?.properties || {};
  }

  protected assertFeature() {
    if (!this._feature$.value || !this.properties) {
      throw new Error('feature lacks valid data or properties');
    }
  }

  private _active$ = new BehaviorSubject<boolean>(false);
  active$: Observable<boolean> = this._active$;

  set active(value: boolean) {
    this._active$.next(value);
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
}

/**
 * A component that defines the functionality of a map feature.
 */
@Component({
  selector: 'map-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-feature.component.html',
})
export class MapFeatureComponent
  extends TileObjectBehavior
  implements AfterViewInit, OnDestroy
{
  @Input() tiledMap: TiledTMXResource;
  @Input() tileMap: TileMap;
  @Input() scene: Scene;
  @ViewChildren('comp') featureQuery: QueryList<TiledFeatureComponent>;
  @Output() onClose: EventEmitter<TiledFeatureComponent> = new EventEmitter();
  @Input() set feature(value: TiledMapFeatureData | null) {
    this._feature$.next(value);
  }
  get feature(): TiledMapFeatureData | null {
    return this._feature$.value;
  }

  private _featureComponent$: Subject<TiledFeatureComponent> =
    new ReplaySubject<TiledFeatureComponent>(1);

  private _feature$: BehaviorSubject<TiledMapFeatureData | null> =
    new BehaviorSubject<TiledMapFeatureData | null>(null);

  feature$: Observable<TiledMapFeatureData | null> = this._feature$;

  class$: Observable<TiledMapFeatureTypes> = this.feature$.pipe(
    map((f) => (f?.class || '') as TiledMapFeatureTypes)
  );

  gameFeatureObject$: Observable<GameFeatureObject | null> = combineLatest(
    [this.feature$, this._featureComponent$],
    (data: TiledMapFeatureData, component: TiledFeatureComponent) => {
      if (!data || !this.tiledMap) {
        return null;
      }
      const result = new GameFeatureObject(data, this.tileMap);
      result.addBehavior(component);
      return result;
    }
  );

  host: GameFeatureObject | null;

  /**
   * Observable of whether this feature is hidden/inactive by its unique ID
   */
  enabled$: Observable<boolean> = combineLatest([
    this._feature$,
    this.store.select(getGameKeyData),
  ]).pipe(
    switchMap((args) => {
      // If there's no unique ID it can't be disabled
      if (!args || !args[0] || !args[0].properties) {
        return of(undefined);
      }
      const f: TiledMapFeatureData = args[0];
      // Select the id/after values and a bool for if after is not undefined
      return combineLatest([
        this.store.select(getGameKey(f.properties.id)),
        this.store.select(getGameKey(f.properties.after)),
        of(!!f.properties.after),
        this.store.select(getGameKey(f.properties.until)),
        of(!!f.properties.until),
      ]);
    }),
    map((keys?) => {
      if (!keys) {
        return true;
      }
      const idKey: boolean | undefined = keys[0];
      const afterKey: boolean | undefined = keys[1];
      const hasAfterKey: boolean = keys[2];
      const untilKey: boolean | undefined = keys[3];
      const hasUntilKey: boolean = keys[4];
      // This is disabled because its id is found in key store
      if (idKey === true) {
        return false;
      }
      // The after key is present and satisfied
      if (hasAfterKey && !afterKey) {
        return false;
      }
      // The until key is present and satisfied
      if (hasUntilKey && untilKey) {
        return false;
      }
      // Nothing stops this, it's enabled
      return true;
    })
  );

  constructor(public store: Store<AppState>) {
    super();
  }

  toString() {
    const featureData = this._feature$.value;
    if (featureData) {
      return `[TiledTMXFeature] (name:${featureData.name}) (id:${featureData.properties.id})`;
    }
    return super.toString();
  }

  private _hostSubscription: Subscription | null;

  ngAfterViewInit(): void {
    if (this.featureQuery.length > 0) {
      this._featureComponent$.next(this.featureQuery.first);
    }
    this._hostSubscription = this.gameFeatureObject$
      .pipe(
        map((featureObject: GameFeatureObject) => {
          this.disconnectHost();
          this.host = featureObject;
          const world = GameWorld.get();
          assertTrue(world, 'invalid game world');
          world.mark(this.host);
          this.scene.addObject(this.host);
        })
      )
      .subscribe();
  }

  private disconnectHost() {
    if (this.host) {
      if (this.scene) {
        this.scene.removeObject(this.host);
      }
      const world = GameWorld.get();
      assertTrue(world, 'invalid world');
      world.erase(this.host);
      this.host.destroy();
      this.host = null;
    }
  }

  ngOnDestroy(): void {
    if (this._hostSubscription) {
      this._hostSubscription.unsubscribe();
      this._hostSubscription = null;
    }
    this.disconnectHost();
  }
}

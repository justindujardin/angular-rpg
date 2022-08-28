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
import { TiledTMXResource } from '../../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import { ITiledObject } from '../../../../game/pow-core/resources/tiled/tiled.model';
import { Scene } from '../../../../game/pow2/scene/scene';
import { TileObject } from '../../../../game/pow2/tile/tile-object';
import { TileObjectBehavior } from '../../../../game/pow2/tile/tile-object-behavior';
import { AppState } from '../../../app.model';
import { getGameKey, getGameKeyData } from '../../../models/selectors';
import { GameFeatureObject } from '../../../scene/game-feature-object';
import { GameWorld } from '../../../services/game-world';

/**
 * An enumeration of the serialized names used to refer to map feature map from within a TMX file
 */
export type TiledMapFeatureTypes =
  | 'PortalFeatureComponent'
  | 'CombatFeatureComponent'
  | 'ShipFeatureComponent'
  | 'TreasureFeatureComponent'
  | 'DoorFeatureComponent'
  | 'DialogFeatureComponent'
  | 'StoreFeatureComponent'
  | 'TempleFeatureComponent';

export type TiledMapFeatureData<PropertiesType = any> = ITiledObject<PropertiesType>;

export class TiledFeatureComponent<
  T extends TiledMapFeatureData = TiledMapFeatureData
> extends TileObjectBehavior {
  host: GameFeatureObject;

  /**
   * Write-only feature input.
   */
  set feature(value: T) {
    this._feature$.next(value);
  }
  get feature(): T {
    return this._feature$.value;
  }

  protected _feature$: BehaviorSubject<T> = new BehaviorSubject(null);

  /**
   * Observable of feature data.
   */
  feature$: Observable<TiledMapFeatureData> = this._feature$;

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
  @Input() set feature(value: TiledMapFeatureData) {
    this._feature$.next(value);
  }

  @Input() tiledMap: TiledTMXResource;

  get feature(): TiledMapFeatureData {
    return this._feature$.value;
  }

  @Input() scene: Scene;

  @ViewChildren('comp') featureQuery: QueryList<TiledFeatureComponent>;

  @Output() onClose: EventEmitter<TiledFeatureComponent> = new EventEmitter();

  private _featureComponent$: Subject<TiledFeatureComponent> =
    new ReplaySubject<TiledFeatureComponent>(1);

  private _feature$: BehaviorSubject<TiledMapFeatureData> =
    new BehaviorSubject<TiledMapFeatureData>(null);

  feature$: Observable<TiledMapFeatureData> = this._feature$;

  class$: Observable<TiledMapFeatureTypes> = this.feature$.pipe(
    map((f) => f.class as TiledMapFeatureTypes)
  );

  gameFeatureObject$: Observable<GameFeatureObject> = combineLatest(
    [this.feature$, this._featureComponent$],
    (data: TiledMapFeatureData, component: TiledFeatureComponent) => {
      if (!data || !this.tiledMap) {
        return null;
      }
      const options = Object.assign({}, data.properties || {}, {
        class: data.class,
        x: Math.round(data.x / this.tiledMap.tilewidth),
        y: Math.round(data.y / this.tiledMap.tileheight),
      });
      const result = new GameFeatureObject(options);
      result.addBehavior(component);
      return result;
    }
  );

  host: GameFeatureObject;

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

  private _hostSubscription: Subscription;

  ngAfterViewInit(): void {
    if (this.featureQuery.length > 0) {
      this._featureComponent$.next(this.featureQuery.first);
    }
    this._hostSubscription = this.gameFeatureObject$
      .pipe(
        map((featureObject: GameFeatureObject) => {
          this.disconnectHost();
          this.host = featureObject;
          GameWorld.get().mark(this.host);
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
      GameWorld.get().erase(this.host);
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

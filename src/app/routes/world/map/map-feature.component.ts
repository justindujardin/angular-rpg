import {GameFeatureObject} from '../../../scene/game-feature-object';
import {TileObjectBehavior} from '../../../../game/pow2/tile/tile-object-behavior';
import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import {Observable, BehaviorSubject, Subscription, Subject, ReplaySubject} from 'rxjs';
import {GameWorld} from '../../../services/game-world';
import {Scene} from '../../../../game/pow2/scene/scene';
import {TiledTMXResource} from '../../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {ITiledObject} from '../../../../game/pow-core/resources/tiled/tiled.model';
import {TileObject} from '../../../../game/pow2/tile/tile-object';
import {getGameKey} from '../../../models/selectors';
import {AppState} from '../../../app.model';
import {Store} from '@ngrx/store';

/**
 * An enumeration of the serialized names used to refer to map feature map from within a TMX file
 */
export type TiledMapFeatureTypes = 'PortalFeatureComponent'
  | 'CombatFeatureComponent'
  | 'ShipFeatureComponent'
  | 'TreasureFeatureComponent'
  | 'DialogFeatureComponent'
  | 'StoreFeatureComponent'
  | 'TempleFeatureComponent';

export type TiledMapFeatureData = ITiledObject;

export class TiledFeatureComponent extends TileObjectBehavior {
  host: GameFeatureObject;

  /**
   * Write-only feature input.
   */
  set feature(value: TiledMapFeatureData) {
    this._feature$.next(value);
  }

  protected _feature$: BehaviorSubject<TiledMapFeatureData> = new BehaviorSubject(null);

  /**
   * Observable of feature data.
   */
  feature$: Observable<TiledMapFeatureData> = this._feature$;

  get properties(): any {
    return this._feature$.value ? (this._feature$.value.properties || {}) : {};
  }

  protected assertFeature() {
    if (!this._feature$.value || !this.properties) {
      throw new Error('feature lacks valid data or properties');
    }
  }

  private _active$ = new BehaviorSubject<boolean>(false);
  active$: Observable<boolean> = this._active$;

  @Input()
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
  templateUrl: './map-feature.component.html'
})
export class MapFeatureComponent extends TileObjectBehavior implements AfterViewInit, OnDestroy {
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

  private _featureComponent$: Subject<TiledFeatureComponent> = new ReplaySubject<TiledFeatureComponent>(1);

  private _feature$: BehaviorSubject<TiledMapFeatureData> = new BehaviorSubject<TiledMapFeatureData>(null);

  feature$: Observable<TiledMapFeatureData> = this._feature$;

  type$: Observable<TiledMapFeatureTypes> = this.feature$.map((f) => f.type);

  gameFeatureObject$: Observable<GameFeatureObject> = this.feature$
    .combineLatest(this._featureComponent$, (data: TiledMapFeatureData, component: TiledFeatureComponent) => {
      if (!data || !this.tiledMap) {
        return null;
      }
      const options = Object.assign({}, data.properties || {}, {
        type: data.type,
        x: Math.round(data.x / this.tiledMap.tilewidth),
        y: Math.round(data.y / this.tiledMap.tileheight)
      });
      const result = new GameFeatureObject(options);
      result.addBehavior(component);
      return result;
    });

  host: GameFeatureObject;

  /**
   * Observable of whether this feature is hidden/inactive by its unique ID
   */
  enabled$: Observable<boolean> = this._feature$
    .switchMap((f: TiledMapFeatureData) => {
      // If there's no unique ID it can't be disabled
      if (!f || !f.properties || !f.properties.id) {
        return Observable.of(undefined);
      }
      // Select just the
      return this.store.select(getGameKey(f.properties.id));
    })
    .map((data) => data !== true);

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
    this._hostSubscription = this.gameFeatureObject$.do((featureObject: GameFeatureObject) => {
      this.disconnectHost();
      this.host = featureObject;
      GameWorld.get().mark(this.host);
      this.scene.addObject(this.host);
    }).subscribe();
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

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

  connectBehavior(): boolean {
    if (!super.connectBehavior()) {
      return false;
    }
    if (!this.host.feature) {
      console.log('Feature host missing feature data.');
      return false;
    }
    // Inherit ID from the unique feature data's id.
    this.id = this.host.feature.id;
    return true;
  }

  syncBehavior(): boolean {
    if (!super.syncBehavior()) {
      return false;
    }
    this.host.visible = this.host.enabled = !this.getDataHidden();
    return true;
  }

  /**
   * Hide and disable a feature object in a persistent manner.
   * @param hidden Whether to hide or unhide the object.
   */
  setDataHidden(hidden: boolean = true) {
    console.warn('fix setDataHidden for hiding map features once they\'ve been destroyed');
    // if (this.host && this.host.world && this.host.world.model && this.host.id) {
    //   this.host.world.model.setKeyData('' + this.host.id, {
    //     hidden: hidden
    //   });
    //   this.syncBehavior();
    // }
  }

  /**
   * Determine if a feature has been persistently hidden by a call
   * to `hideFeature`.
   */
  getDataHidden(): boolean {
    console.warn('fix getDataHidden for hiding map features once they\'ve been destroyed');
    // if (this.host && this.host.world && this.host.world.model && this.host.id) {
    //   var data: any = this.host.world.model.getKeyData('' + this.host.id);
    //   if (data && data.hidden) {
    //     return true;
    //   }
    // }
    return false;
  }
}

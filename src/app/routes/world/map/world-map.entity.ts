import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {CombatPlayerRenderBehaviorComponent} from './behaviors/combat-player-render.behavior';
import {SceneObjectBehavior} from '../../../../game/pow2/scene/scene-object-behavior';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
import {CombatComponent} from './combat.component';
import {Observable, Subscription} from 'rxjs';
import {GameStateService} from '../../../models/game-state/game-state.service';
import {TiledTMXResource} from '../../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {ResourceManager} from '../../../../game/pow-core/resource-manager';
import {Behavior} from '../../../../game/pow-core/behavior';
import {MapFeatureInputBehaviorComponent} from '../behaviors/map-feature-input.behavior';
import {Scene} from '../../../../game/pow2/scene/scene';
import {MapFeatureComponent, TiledMapFeatureData} from './map-feature.component';
import {ISceneViewRenderer} from '../../../../game/pow2/scene/scene.model';
import {TileObjectRenderer} from '../../../../game/pow2/tile/render/tile-object-renderer';
import {SceneView} from '../../../../game/pow2/scene/scene-view';
import {WorldPlayerComponent} from './world-player.entity';
import {Entity} from '../../../models/entity/entity.model';
import {getGameKeyData, getGameParty, getGamePartyPosition} from '../../../models/selectors';
import {IPoint, Point} from '../../../../game/pow-core/point';
import {LoadingService} from '../../../components/loading/loading.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../app.model';
import {GameTileMap} from '../../../scene/game-tile-map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as Immutable from 'immutable';

//
// TODO: Player position is not sync'd to store!
//
//

@Component({
  selector: 'world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'world-map.entity.html'
})
export class WorldMapComponent extends GameTileMap implements AfterViewInit, OnDestroy, ISceneViewRenderer {

  /** For referencing in template */
  readonly self: WorldMapComponent = this;

  @Input() scene: Scene;

  renderPoint: Point = new Point();

  @ViewChild(WorldPlayerComponent) player: WorldPlayerComponent;
  @ViewChildren('input') behaviors: QueryList<Behavior>;
  @ViewChildren(MapFeatureComponent) mapFeatures: QueryList<MapFeatureComponent>;

  private _subscriptions: Subscription[] = [];

  /** The {@see TiledTMXResource} map at the input url */
  resource$: Observable<TiledTMXResource> = this.gameStateService.worldMap$
    .distinctUntilChanged()
    .map((result: TiledTMXResource) => {
      this.setMap(result);
      return result;
    });

  /** Features can be derived after a new map resource has been loaded */
  features$: Observable<TiledMapFeatureData[]> = this.resource$.map(() => {
    return this.features.objects;
  });

  /**
   * Exclude features that are marked as hidden in the game keydata storage.
   */
  activeFeatures$: Observable<any> = this.store.select(getGameKeyData)
    .combineLatest(this.features$, (keyMap: Immutable.Map<string, any>, features: TiledMapFeatureData[]) => {
      return features.filter((f: TiledMapFeatureData) => {
        // If it doesn't have an ID then it can't be hidden.
        // If there is a value in the keyData with the id as a key and true as a value, the feature is hidden.
        return !f.properties || !f.properties.id || keyMap.get(f.properties.id) !== true;
      });
    });

  private _renderPoint$: BehaviorSubject<IPoint> = new BehaviorSubject(this.renderPoint);

  /** Observable of the current player position in the world */
  renderPoint$: Observable<Point> = this.store.select(getGamePartyPosition)
    .combineLatest(this._renderPoint$, (point: IPoint, renderPoint: IPoint) => {
      return this.renderPoint.set(point || renderPoint);
    });

  constructor(public gameStateService: GameStateService,
              public store: Store<AppState>,
              public loadingService: LoadingService,
              public loader: ResourceManager) {
    super();
  }

  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.addBehavior(c);
    });
    // To update renderPoint when party point changes
    this._subscriptions.push(this.position$.subscribe());
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.removeBehavior(c);
    });
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions.length = 0;
    this.destroy();
  }

  //
  // ISceneViewRenderer
  //
  objectRenderer: TileObjectRenderer = new TileObjectRenderer();

  beforeFrame(view: SceneView, elapsed: number) {
    // Nope
  }

  /**
   * Render all of the map feature components
   */
  renderFrame(view: SceneView, elapsed: number) {
    this.mapFeatures.forEach((mapFeatureComponent: MapFeatureComponent) => {
      if (mapFeatureComponent.host) {
        const data = mapFeatureComponent.host;
        this.objectRenderer.render(data, data.renderPoint || data.point, view, data.meta);
      }
    });
  }

  afterFrame(view: SceneView, elapsed: number) {
    // Nope
  }

  //
  // Party position
  //

  notTraveling$: Observable<boolean> = this.loadingService.loading$.map((loading: boolean) => !loading);

  /** Observable of the current player position in the world. Keeps renderPoint in sync after each move. */
  position$: Observable<IPoint> = this.store
    .select(getGamePartyPosition)
    .distinctUntilChanged()
    .do((position: IPoint) => {
      this.renderPoint = new Point(position);
    });

  /** Observable of Entity representing the player-card leader to be rendered in the world */
  partyLeader$: Observable<Entity> = this.store.select(getGameParty)
    .map((party: Immutable.List<Entity>) => {
      return party.get(0);
    });

}

/** Components associated with world map */
export const WORLD_MAP_COMPONENTS = [
  WorldMapComponent,
  MapFeatureComponent,
  MapFeatureInputBehaviorComponent
];

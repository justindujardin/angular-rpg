import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  Input,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import {CombatPlayerRenderBehaviorComponent} from './behaviors/combat-player-render.behavior';
import {SceneComponent} from '../../../../game/pow2/scene/sceneComponent';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
import {CombatComponent} from './combat.component';
import {Observable, Subscription} from 'rxjs';
import {GameStateService} from '../../../models/game-state/game-state.service';
import {TiledTMXResource} from '../../../../game/pow-core/resources/tiled/tiledTmx';
import {ResourceLoader} from '../../../../game/pow-core/resourceLoader';
import {Behavior} from '../../../../game/pow-core/behavior';
import {MapFeatureInputBehaviorComponent} from '../behaviors/map-feature-input.behavior';
import {Scene} from '../../../../game/pow2/scene/scene';
import {MapFeatureComponent} from './map-feature.component';
import {ISceneViewRenderer} from '../../../../game/pow2/interfaces/IScene';
import {TileObjectRenderer} from '../../../../game/pow2/tile/render/tileObjectRenderer';
import {SceneView} from '../../../../game/pow2/scene/sceneView';
import {WorldPlayerComponent} from './world-player.entity';
import {Entity} from '../../../models/entity/entity.model';
import {getGameParty, getGamePartyPosition} from '../../../models/selectors';
import {Point, IPoint} from '../../../../game/pow-core/point';
import {LoadingService} from '../../../components/loading/loading.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../app.model';
import {GameTileMap} from '../../../../game/gameTileMap';

@Component({
  selector: 'world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'world-map.entity.html'
})
export class WorldMapComponent extends GameTileMap implements AfterViewInit, OnDestroy, ISceneViewRenderer {

  /** For referencing in template */
  readonly self: WorldMapComponent = this;

  @Input() scene: Scene;

  renderPoint: IPoint;

  @ViewChild(WorldPlayerComponent) player: WorldPlayerComponent;
  @ViewChildren('input,encounter') behaviors: QueryList<Behavior>;
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
  features$: Observable<any> = this.resource$.map(() => {
    return this.features.objects;
  });

  constructor(public gameStateService: GameStateService,
              public store: Store<AppState>,
              public loadingService: LoadingService,
              public loader: ResourceLoader) {
    super();
  }

  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.addBehavior(c);
    });
    // To update renderPoint when party point changes
    this._subscriptions.push(this.position$.subscribe());
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
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
        this.objectRenderer.render(data, data, view);
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
    .map((party: Entity[]) => {
      return Object.assign({}, party[0]);
    });

}

/** Components associated with world map */
export const WORLD_MAP_COMPONENTS = [
  WorldMapComponent,
  MapFeatureComponent,
  MapFeatureInputBehaviorComponent
];

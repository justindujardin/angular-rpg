import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import {CombatPlayerRenderBehaviorComponent} from './behaviors/combat-player-render.behavior';
import {SceneComponent} from '../../../../game/pow2/scene/sceneComponent';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
import {CombatComponent} from './combat.component';
import {GameTileMap} from '../../../../game/gameTileMap';
import {Observable} from 'rxjs';
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

@Component({
  selector: 'world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'world-map.entity.html'
})
export class WorldMapComponent extends GameTileMap implements AfterViewInit, OnDestroy, ISceneViewRenderer {
  @Input() scene: Scene;

  @ViewChildren('input,encounter') behaviors: QueryList<Behavior>;
  @ViewChildren(MapFeatureComponent) mapFeatures: QueryList<MapFeatureComponent>;

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

  constructor(public gameStateService: GameStateService, public loader: ResourceLoader) {
    super();
  }

  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.removeBehavior(c);
    });
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

}

/** Components associated with world map */
export const WORLD_MAP_COMPONENTS = [
  WorldMapComponent,
  MapFeatureComponent,
  MapFeatureInputBehaviorComponent
];

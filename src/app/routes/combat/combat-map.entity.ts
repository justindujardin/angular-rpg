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
import {GameTileMap} from '../../scene/game-tile-map';
import {ISceneViewRenderer} from '../../../game/pow2/scene/scene.model';
import {Scene} from '../../../game/pow2/scene/scene';
import {TiledTMXResource} from '../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {Observable} from 'rxjs/Observable';
import {getCombatEncounter, getCombatEncounterEnemies, getCombatEncounterParty} from '../../models/selectors';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {LoadingService} from '../../components/loading/loading.service';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {TileObjectRenderer} from '../../../game/pow2/tile/render/tile-object-renderer';
import {SceneView} from '../../../game/pow2/scene/scene-view';
import {Combatant, CombatEncounterTypes} from '../../models/combat/combat.model';
import {Entity} from '../../models/entity/entity.model';
import {CombatCameraBehaviorComponent} from './behaviors/combat-camera.behavior';
import {CombatService} from '../../services/combat.service';
import {CombatPlayerComponent} from './combat-player.entity';
import {CombatEnemyComponent} from './combat-enemy.entity';
import {TileMapRenderer} from '../../../game/pow2/tile/render/tile-map-renderer';
import {TileMapView} from '../../../game/pow2/tile/tile-map-view';
import {Subscription} from 'rxjs/Subscription';
import {IPoint, Point} from '../../../game/pow-core/point';
import {SpriteComponent} from "../../../game/pow2/tile/behaviors/sprite.behavior";


@Component({
  selector: 'combat-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './combat-map.entity.html'
})
export class CombatMapComponent extends GameTileMap implements AfterViewInit, OnDestroy, ISceneViewRenderer {

  private _tileRenderer: TileMapRenderer = new TileMapRenderer();

  @Input() scene: Scene;

  @ViewChild(CombatCameraBehaviorComponent) camera: CombatCameraBehaviorComponent;

  /** Observable<Combatant[]> of enemies */
  enemies$: Observable<Combatant[]> = this.store.select(getCombatEncounterEnemies);

  /** Observable<Entity[]> of player-card members */
  party$: Observable<Entity[]> = this.store.select(getCombatEncounterParty);

  /** Observable<CombatEncounter> */
  encounter$: Observable<CombatEncounterTypes> = this.store.select(getCombatEncounter);

  @ViewChildren(CombatPlayerComponent) party: QueryList<CombatPlayerComponent>;
  @ViewChildren(CombatEnemyComponent) enemies: QueryList<CombatEnemyComponent>;

  /** The {@see TiledTMXResource} map at the input url */
  resource$: Observable<TiledTMXResource> = this.combatService.combatMap$
    .distinctUntilChanged()
    .map((result: TiledTMXResource) => {
      this.setMap(result);
      return result;
    });

  /** Features can be derived after a new map resource has been loaded */
  features$: Observable<any> = this.resource$.map(() => {
    return this.features.objects;
  });

  constructor(public combatService: CombatService,
              public store: Store<AppState>,
              public loadingService: LoadingService,
              public loader: ResourceManager) {
    super();
  }

  /**
   * @internal used to make `resource$` observable hot. Can be removed if the template references an
   * async binding for this at any point.
   */
  private _resourceSubscription: Subscription;

  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.addBehavior(this.camera);
    this._resourceSubscription = this.resource$.do(() => {
      this.party.forEach((p: CombatPlayerComponent, index: number) => {
        p.setSprite(p.model.icon);
        const battleSpawn = this.getFeature('p' + (index + 1)) as IPoint;
        p.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
      });
      this.enemies.forEach((e: CombatEnemyComponent, index: number) => {
        const battleSpawn = this.getFeature('e' + (index + 1)) as IPoint;
        if (battleSpawn) {
          e.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
        }
      });
    }).subscribe();
  }

  ngOnDestroy(): void {
    this._resourceSubscription.unsubscribe();
    this.scene.removeObject(this);
    this.removeBehavior(this.camera);
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
  renderFrame(view: TileMapView, elapsed: number) {
    this._tileRenderer.render(this, view);
    this.party.forEach((component: CombatPlayerComponent) => {
      this.objectRenderer.render(component, component.renderPoint || component.point, view, component.meta);
      const sprites = component.findBehaviors(SpriteComponent) as SpriteComponent[];
      sprites.forEach((sprite: SpriteComponent) => {
        this.objectRenderer.render(sprite.host, sprite.host.point, view, sprite.meta);
      });
    });
    this.enemies.forEach((component: CombatEnemyComponent) => {
      this.objectRenderer.render(component, component.renderPoint || component.point, view, component.meta);
      const sprites = component.findBehaviors(SpriteComponent) as SpriteComponent[];
      sprites.forEach((sprite: SpriteComponent) => {
        this.objectRenderer.render(sprite, sprite.host.point, view, sprite.meta);
      });
    });
  }

  afterFrame(view: SceneView, elapsed: number) {
    // Nope
  }
}

/** Components associated with combat map */
export const COMBAT_MAP_COMPONENTS = [
  CombatMapComponent,
  CombatCameraBehaviorComponent
];

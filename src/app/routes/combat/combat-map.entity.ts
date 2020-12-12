import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { List } from 'immutable';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { CombatantTypes, IEnemy, IPartyMember } from '../../models/base-entity';
import { IPoint, Point } from '../../../game/pow-core/point';
import { ResourceManager } from '../../../game/pow-core/resource-manager';
import { TiledTMXResource } from '../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import { Scene } from '../../../game/pow2/scene/scene';
import { SceneView } from '../../../game/pow2/scene/scene-view';
import { ISceneViewRenderer } from '../../../game/pow2/scene/scene.model';
import { SpriteComponent } from '../../../game/pow2/tile/behaviors/sprite.behavior';
import { TileMapRenderer } from '../../../game/pow2/tile/render/tile-map-renderer';
import { TileObjectRenderer } from '../../../game/pow2/tile/render/tile-object-renderer';
import { TileMapView } from '../../../game/pow2/tile/tile-map-view';
import { AppState } from '../../app.model';
import { LoadingService } from '../../components/loading/loading.service';
import { CombatState } from '../../models/combat/combat.model';
import { CombatService } from '../../models/combat/combat.service';
import {
  getCombatEncounterEnemies,
  getCombatEncounterParty,
  sliceCombatState,
} from '../../models/selectors';
import { GameTileMap } from '../../scene/game-tile-map';
import { CombatCameraBehaviorComponent } from './behaviors/combat-camera.behavior';
import { CombatEnemyComponent } from './combat-enemy.entity';
import { CombatHUDComponent } from './combat-hud.component';
import { CombatPlayerComponent } from './combat-player.entity';

@Component({
  selector: 'combat-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './combat-map.entity.html',
})
export class CombatMapComponent
  extends GameTileMap
  implements AfterViewInit, OnDestroy, ISceneViewRenderer {
  private _tileRenderer: TileMapRenderer = new TileMapRenderer();

  @Input() scene: Scene;
  @Input() combat: any; // _ TODO: This creates a nasty circular import situation

  @ViewChild(CombatCameraBehaviorComponent)
  camera: CombatCameraBehaviorComponent;

  enemies$: Observable<List<IEnemy>> = this.store.select(getCombatEncounterEnemies);

  party$: Observable<List<IPartyMember>> = this.store.select(getCombatEncounterParty);

  encounter$: Observable<CombatState> = this.store.select(sliceCombatState);

  @ViewChildren('partyMember') party: QueryList<CombatPlayerComponent>;
  @ViewChildren('enemy') enemies: QueryList<CombatEnemyComponent>;

  /** The {@see TiledTMXResource} map at the input url */
  resource$: Observable<TiledTMXResource> = this.combatService.combatMap$.pipe(
    distinctUntilChanged(),
    map((result: TiledTMXResource) => {
      this.setMap(result);
      return result;
    })
  );

  /** Features can be derived after a new map resource has been loaded */
  features$: Observable<any> = this.resource$.pipe(
    map(() => {
      return this.features.objects;
    })
  );

  constructor(
    public combatService: CombatService,
    public store: Store<AppState>,
    public loadingService: LoadingService,
    public loader: ResourceManager
  ) {
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
    // Whenever the underlying map resource changes, update party/enemy state from latest values.
    this._resourceSubscription = this.resource$
      .pipe(
        map(() => {
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
        })
      )
      .subscribe();
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
      this.objectRenderer.render(
        component,
        component.renderPoint || component.point,
        view,
        component.meta
      );
      const sprites = component.findBehaviors(SpriteComponent) as SpriteComponent[];
      sprites.forEach((sprite: SpriteComponent) => {
        this.objectRenderer.render(sprite, sprite.host.point, view, sprite.meta);
      });
    });
    this.enemies.forEach((component: CombatEnemyComponent) => {
      this.objectRenderer.render(
        component,
        component.renderPoint || component.point,
        view,
        component.meta
      );
      const sprites: SpriteComponent[] = component.findBehaviors(SpriteComponent);
      sprites.forEach((sprite: SpriteComponent) => {
        this.objectRenderer.render(sprite, sprite.host.point, view, sprite.meta);
      });
    });
  }

  afterFrame(view: SceneView, elapsed: number) {
    // Nope
  }

  /**
   * Custom track by function for combatants. We need to keep them around by their
   * entity instance id so that the components are not created/destroyed as their
   * underlying model changes. This is important because these components instances
   * are passed through the combat state machine and their references must remain valid.
   */
  combatTrackBy(index: number, item: CombatantTypes): any {
    return item.eid;
  }
}

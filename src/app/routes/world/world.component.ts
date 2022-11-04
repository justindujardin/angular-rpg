import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { TileMapPathBehavior } from '../../behaviors/tile-map-path.behavior';
import { DebugMenuComponent } from '../../components/debug-menu/debug-menu.component';
import { LoadingService } from '../../components/loading/loading.service';
import { NotificationService } from '../../components/notification/notification.service';
import { PartyMenuComponent } from '../../components/party-menu/party-menu.component';
import { Behavior, IPoint, Point, Rect, TiledTMXResource } from '../../core';
import { NamedMouseElement, PowInput } from '../../core/input';
import { ITiledObject } from '../../core/resources/tiled/tiled.model';
import { Entity } from '../../models/entity/entity.model';
import { GameStateService } from '../../models/game-state/game-state.service';
import {
  getGameKeyData,
  getGameParty,
  getGamePartyPosition,
} from '../../models/selectors';
import { assertTrue } from '../../models/util';
import { GameFeatureObject } from '../../scene/objects/game-feature-object';
import {
  TileObjectRenderer,
  TileRenderable,
} from '../../scene/render/tile-object-renderer';
import { Scene } from '../../scene/scene';
import { SceneView } from '../../scene/scene-view';
import { TileMap } from '../../scene/tile-map';
import { GameWorld } from '../../services/game-world';
import { RPGGame } from '../../services/rpg-game';
import { PlayerBehaviorComponent } from './behaviors/player-behavior';
import { MapFeatureComponent } from './map-feature.component';
import { WorldPlayerComponent } from './world-player.component';

@Component({
  selector: 'world',
  styleUrls: ['./world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './world.component.html',
  host: {
    '(window:resize)': '_onResize($event)',

    '(click)': '_onClick($event)',
    '[style.color]': 'styleBackground',
  },
})
export class WorldComponent extends SceneView implements AfterViewInit, OnDestroy {
  @ViewChild('worldCanvas') canvasElementRef: ElementRef;
  @ViewChild(PartyMenuComponent) partyMenu: PartyMenuComponent;
  @ViewChild(DebugMenuComponent) debugMenu: DebugMenuComponent;
  @ViewChild(WorldPlayerComponent) player: WorldPlayerComponent;
  @ViewChildren('input') behaviors: QueryList<Behavior>;
  @ViewChildren('feature') mapFeatures: QueryList<MapFeatureComponent>;
  /**
   * Whether to render debug view information
   */
  @Input() debug: boolean = false;

  zeroPoint: Point = new Point();

  /** The {@see TiledTMXResource} map at the input url */
  resource$: Observable<TiledTMXResource> = this.gameStateService.worldMap$.pipe(
    distinctUntilChanged(),
    map((result: TiledTMXResource) => {
      this.map.setMap(result);
      return result;
    })
  );

  /** Features can be derived after a new map resource has been loaded */
  features$: Observable<ITiledObject[]> = this.resource$.pipe(
    map(() => {
      return this.map.features?.objects || [];
    })
  );

  /**
   * Exclude features that are marked as hidden in the game keydata storage.
   */
  activeFeatures$: Observable<any> = combineLatest(
    [this.store.select(getGameKeyData), this.features$],
    (keyMap: Immutable.Map<string, any>, features: ITiledObject[]) => {
      const out = features.filter((f: ITiledObject) => {
        const idKey = !!keyMap.get(f.properties?.id);
        const hasAfterKey = typeof f.properties?.after !== 'undefined';
        const hasUntilKey = typeof f.properties?.until !== 'undefined';
        const afterKey = keyMap.get(f.properties?.after);
        const untilKey = keyMap.get(f.properties?.until);
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
      });
      return out;
    }
  );

  notTraveling$: Observable<boolean> = this.loadingService.loading$.pipe(
    map((loading: boolean) => !loading)
  );

  /** Observable of the current player position in the world. Keeps renderPoint in sync after each move. */
  position$: Observable<IPoint> = this.store.select(getGamePartyPosition).pipe(
    distinctUntilChanged(),
    map((position: IPoint) => {
      this.renderPoint = new Point(position);
      return this.renderPoint;
    })
  );

  /** Observable of Entity representing the player-card leader to be rendered in the world */
  partyLeader$: Observable<Entity | null> = this.store.select(getGameParty).pipe(
    map((party: Immutable.List<Entity>) => {
      return party.get(0) || null;
    })
  );
  private _renderPoint$: BehaviorSubject<IPoint> = new BehaviorSubject(
    this.renderPoint
  );

  /** Observable of the current player position in the world */
  renderPoint$: Observable<Point> = combineLatest(
    [this.store.select(getGamePartyPosition), this._renderPoint$],
    (point: IPoint, renderPoint: IPoint) => {
      this.renderPoint.set(point || renderPoint);
      return this.renderPoint;
    }
  );

  /**
   * Escape action handler. Escape out of any active feature or menu
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      // Escape out of any feature the player is currently in
      if (this.player && this.player.feature) {
        this.player.escapeFeature();
      } else if (this.debugMenu.open) {
        // Otherwise toggle the party menu
        this.debugMenu.open = false;
      } else if (this.partyMenu) {
        // Otherwise toggle the party menu
        this.partyMenu.open = !this.partyMenu.open;
        if (this.partyMenu.open) {
          this.debugMenu.open = false;
        }
      }
    } else if (event.key === '1') {
      this.debug = !this.debug;
    } else if (event.key === '2') {
      this.debugMenu.open = !this.debugMenu.open;
      if (this.debugMenu.open) {
        this.partyMenu.open = false;
      }
    }
  }

  /** For referencing in template */
  readonly self: WorldComponent = this;
  map: TileMap = new TileMap();
  renderPoint: Point = new Point();
  styleBackground: string = 'rgba(0,0,0,1)';
  mouse: NamedMouseElement | null = null;
  scene: Scene = new Scene();
  objectRenderer: TileObjectRenderer = new TileObjectRenderer();
  private _subscription: Subscription | null = null;
  constructor(
    public game: RPGGame,
    public notify: NotificationService,
    public gameStateService: GameStateService,
    public loadingService: LoadingService,
    public store: Store<AppState>,
    public world: GameWorld
  ) {
    super();
    this.world.mark(this.scene);
    this.world.time.start();
  }

  ngOnDestroy(): void {
    this.world.erase(this.scene);
    this.scene.removeObject(this.map);
    this.scene.removeView(this);
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.camera.point.set(0, 0);
    this.scene.addView(this);
    this.scene.addObject(this.map);
    setTimeout(() => this._onResize(), 1);
  }

  _onResize(event?: Event) {
    super._onResize(event);
    // Camera (window bounds)
    if (this.map) {
      const tileOffset = this.map.bounds.getCenter();
      const offset = this._bounds.clone().divide(2).multiply(-1).add(tileOffset);
      this.camera.point.set(offset.floor());
    }
    this.camera.extent.set(this._bounds);
  }

  //
  // ISceneView implementation
  //
  onAddToScene(scene: Scene) {
    super.onAddToScene(scene);
    this.mouse = this.world.input.mouseHook(this, 'world');
    assertTrue(this.map, 'world does not have a valid tilemap');
    assertTrue(this._subscription === null, 'leaked world tilemap subscription');
    this._subscription = this.map.onLoaded$.subscribe(() => this.syncBehaviors());
  }

  onRemoveFromScene(scene: Scene) {
    this.world.input.mouseUnhook('world');
    assertTrue(this.map, 'world does not have a valid tilemap');
    assertTrue(this._subscription, 'unmatched world tilemap subscription');
    this._subscription.unsubscribe();
  }

  _onClick(e: MouseEvent) {
    // Ignore clicks that did not originate on the canvas
    if (e.srcElement !== this.canvas) {
      return;
    }

    // TODO: Skip this scene lookup and use the player component and its path behavior.
    const pathComponent =
      this.scene.componentByType<TileMapPathBehavior>(TileMapPathBehavior);
    const playerComponent = this.scene.componentByType<PlayerBehaviorComponent>(
      PlayerBehaviorComponent
    );
    if (pathComponent && playerComponent && this.mouse) {
      PowInput.mouseOnView(e, this.mouse.view, this.mouse);
      playerComponent.path = pathComponent.calculatePath(
        playerComponent.targetPoint,
        this.mouse.world
      );
      e.preventDefault();
      return false;
    }
  }

  /**
   * Render the tile map and any features it has.
   */
  renderFrame(elapsed: number) {
    super.renderFrame(elapsed);
    // Map renders features
    if (this.map) {
      this.mapFeatures.forEach((mapFeatureComponent: MapFeatureComponent) => {
        if (mapFeatureComponent) {
          const data = mapFeatureComponent;
          this.objectRenderer.render(
            data as TileRenderable,
            data.renderPoint || data.point,
            this
          );
        }
      });
      // Player renders self and target paths
      if (this.player) {
        this.player.renderFrame(this, elapsed);
      }
    }
    if (this.debug) {
      this.debugRender();
    }
    return this;
  }

  /**
   * Render Tile debug information.
   */
  debugRender() {
    const debugStrings = [`Camera: (${this.camera.point.x},${this.camera.point.y})`];
    const player = this.scene.objectByComponent(PlayerBehaviorComponent);
    if (player) {
      debugStrings.push(`Player: (${player.point.x},${player.point.y})`);
    }
    const clipRect = this.getCameraClip();
    debugStrings.push(
      `Clip: (${clipRect.point.x},${clipRect.point.y}) (${clipRect.extent.x},${clipRect.extent.y})`
    );

    if (!this.context) {
      return;
    }

    // Render the clip rectangle
    this.context.strokeStyle = '#00ff00';
    const screenClip = this.worldToScreen(clipRect);
    this.context.strokeRect(
      screenClip.point.x,
      screenClip.point.y,
      screenClip.extent.x,
      screenClip.extent.y
    );

    // Render impassable tiles on the map in the clip rect
    this.context.strokeStyle = '#ff0000';
    const clipXMin = clipRect.point.x;
    const clipXMax = clipRect.getRight();
    const clipYMin = clipRect.point.y;
    const clipYMax = clipRect.getBottom();
    for (let x = clipXMin; x <= clipXMax; x++) {
      for (let y = clipYMin; y <= clipYMax; y++) {
        this.map.getLayers().forEach((layer) => {
          const tile = this.map.getTerrain(layer.name, x, y);
          if (tile && tile.properties?.passable === false) {
            const screenTile: Rect = this.worldToScreen(
              new Rect(new Point(x - 0.5, y - 0.5), new Point(1, 1))
            );
            this.context?.strokeRect(
              screenTile.point.x,
              screenTile.point.y,
              screenTile.extent.x,
              screenTile.extent.y
            );
          }
        });
      }
    }

    // Game features
    this.context.strokeStyle = '#0000FF';
    const tiles = this.scene.objectsByType(GameFeatureObject);
    tiles.forEach((object: any) => {
      const point = object.renderPoint || object.point;
      const screenTile: Rect = this.worldToScreen(
        new Rect(new Point(point.x - 0.5, point.y - 0.5), new Point(1, 1))
      );
      this.context?.strokeRect(
        screenTile.point.x,
        screenTile.point.y,
        screenTile.extent.x,
        screenTile.extent.y
      );
    });

    // Framerate information
    debugStrings.push(`MSPF: ${this.world.time.mspf}`);
    debugStrings.push(`FPS:  ${this.scene.fps.toFixed(0)}`);

    // Debug strings
    const fontSize = 6;
    this.context.save();
    this.context.font = `bold ${fontSize}px Roboto`;
    const renderPos = this.worldToScreen(clipRect.point);
    let textX = renderPos.x + 10;
    let textY = renderPos.y + 10;
    let i: number;
    for (i = 0; i < debugStrings.length; ++i) {
      this.context.fillStyle = 'rgba(0,0,0,0.8)';
      this.context.fillText(debugStrings[i], textX + 1, textY + 1);
      this.context.fillStyle = 'rgba(255,255,255,1)';
      this.context.fillText(debugStrings[i], textX, textY);
      textY += fontSize;
    }
    this.context.restore();
  }
}

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {NotificationService} from '../../components/notification/notification.service';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable, ReplaySubject, Subscription, BehaviorSubject} from 'rxjs/Rx';
import {GameTileMap} from '../../../game/gameTileMap';
import {IPoint, Point, Rect} from '../../../game/pow-core';
import * as Immutable from 'immutable';
import {GameResources} from '../../services/game-resources.service';
import {GameFeatureComponent} from '../../../game/rpg/components/gameFeatureComponent';
import {MovableComponent} from '../../../game/pow2/scene/components/movableComponent';
import {SpriteComponent} from '../../../game/pow2/tile/components/spriteComponent';
import {PlayerComponent} from '../../../game/rpg/components/playerComponent';
import {PlayerRenderComponent} from '../../../game/pow2/game/components/playerRenderComponent';
import {GameFeatureObject} from '../../../game/rpg/objects/gameFeatureObject';
import {SceneObject} from '../../../game/pow2/scene/sceneObject';
import {Scene} from '../../../game/pow2/scene/scene';
import {SceneView} from '../../../game/pow2/scene/sceneView';
import {TileMap} from '../../../game/pow2/tile/tileMap';
import {PathComponent} from '../../../game/pow2/tile/components/pathComponent';
import {PowInput, NamedMouseElement} from '../../../game/pow2/core/input';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';
import {GameStateTravelAction, GameStateAddGoldAction} from '../../models/game-state/game-state.actions';
import {TileMapView} from '../../../game/pow2/tile/tileMapView';
import {TileObjectRenderer} from '../../../game/pow2/tile/render/tileObjectRenderer';
import {GameStateService} from '../../models/game-state/game-state.service';
import {LoadingService} from '../../components/loading/loading.service';
import {getGameParty, getGamePartyPosition} from '../../models/selectors';
import {Entity} from '../../models/entity/entity.model';
import {TreasureFeatureComponent} from '../../../game/rpg/components/features/treasureFeatureComponent';
import {Item} from '../../models/item';
import {EntityAddItemAction} from '../../models/entity/entity.actions';

@Component({
  selector: 'world',
  styleUrls: ['./world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './world.component.html',
  host: {
    '(window:resize)': '_onResize($event)',
    '(click)': '_onClick($event)',
    '[style.color]': 'styleBackground'
  }
})
export class WorldComponent extends TileMapView implements AfterViewInit, OnDestroy {
  /** Types of map features to listen for interaction with */
  private _featureTypes: string[] = [
    'TempleFeatureComponent',
    'DialogFeatureComponent',
    'PortalFeatureComponent',
    'StoreFeatureComponent',
    'ShipFeatureComponent'
  ];

  private _featureComponent$ = new ReplaySubject<GameFeatureComponent>(null);

  featureComponent$: Observable<GameFeatureComponent> = this._featureComponent$;

  private _playerEntity$ = new BehaviorSubject<GameEntityObject>(null);

  playerEntity$: Observable<GameEntityObject> = this._playerEntity$;

  @ViewChild('worldCanvas') canvasElementRef: ElementRef;

  /**
   * The feature type (if any) that is active.
   * relevant piece of UI to interact with the feature.
   */
  featureType$: Observable<string> = this.featureComponent$
  // return host type name
    .map((f: GameFeatureComponent) => {
      if (f && f.host) {
        return f.host.type;
      }
      return '';
    });

  /** Observable of the current player position in the world */
  position$: Observable<IPoint> = this.store
    .select(getGamePartyPosition)
    .distinctUntilChanged();

  /** Observable of Entity representing the player-card leader to be rendered in the world */
  partyLeader$: Observable<Entity> = this.store.select(getGameParty)
    .map((party: Entity[]) => {
      return Immutable.Map(party[0]).toJS();
    });

  map: GameTileMap;

  /** The fill color to use when rendering a path target. */
  targetFill: string = 'rgba(10,255,10,0.3)';
  /** The stroke to use when outlining path target. */
  targetStroke: string = 'rgba(10,255,10,0.3)';
  /** Line width for the path target stroke. */
  targetStrokeWidth: number = 1.5;
  styleBackground: string = 'rgba(0,0,0,1)';

  objectRenderer: TileObjectRenderer = new TileObjectRenderer();
  mouse: NamedMouseElement = null;
  scene: Scene = new Scene();

  private _subscriptions: Subscription[] = [];

  constructor(public game: RPGGame,
              public notify: NotificationService,
              public loadingService: LoadingService,
              public store: Store<AppState>,
              public gameStateService: GameStateService,
              public world: GameWorld) {
    super();
    this.world.mark(this.scene);

    // Whenever the player is created, or the position changes
    this._subscriptions.push(this.position$.combineLatest(this.playerEntity$)
      .distinctUntilChanged()
      .do((tuple: any) => {
        const position: IPoint = tuple[0];
        const player: GameEntityObject = tuple[1];
        if (player && !player.point.equal(position)) {
          player.setPoint(position);
        }
      }).subscribe());

    // When the state position doesn't match where the user is
    this._subscriptions.push(this.gameStateService.worldMap$.combineLatest(this.partyLeader$)
      .distinctUntilChanged()
      .do((tuple: any) => {
        const map: GameTileMap = tuple[0];
        const player: Entity = tuple[1];
        this.renderModel(map, player);
      }).subscribe());
  }

  ngOnDestroy(): void {
    this.world.erase(this.scene);
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions.length = 0;
    this.scene.removeView(this);
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.camera.point.set(-0.5, -0.5);
    this.scene.addView(this);
    setTimeout(() => this._onResize(), 1);
  }

  public _onResize(event?: Event) {
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
    this.clearCache();
    this.mouse = this.world.input.mouseHook(<SceneView> this, 'world');
    scene.on(TileMap.Events.MAP_LOADED, this.syncBehaviors, this);

    // When a portal is entered, update the map view to reflect the change.
    scene.on('PortalFeatureComponent:entered', (data: any) => {
      this.store.dispatch(new GameStateTravelAction(data.map, data.target));
    }, this);

    scene.on('TreasureFeatureComponent:entered', (feature: TreasureFeatureComponent) => {
      if (typeof feature.gold !== 'undefined') {
        this.store.dispatch(new GameStateAddGoldAction(feature.gold));
        this.notify.show(`You found ${feature.gold} gold!`, null, 0);
      }
      if (typeof feature.item === 'string') {
        const item = this.game.world.itemModelFromId<Item>(feature.item);
        if (!item) {
          return;
        }
        this.store.dispatch(new EntityAddItemAction(item));
        this.notify.show(`You found ${item.name}!`, null, 0);
      }
    }, this);

    this._featureTypes.forEach((eventName: string) => {
      scene.on(eventName + ':entered', (c: GameFeatureComponent) => {
        this._featureComponent$.next(c);
      }, this);
      scene.on(eventName + ':exited', (c: GameFeatureComponent) => {
        this._featureComponent$.next(null);
      }, this);
    });
  }

  onRemoveFromScene(scene: Scene) {
    this.clearCache();
    this.world.input.mouseUnhook('world');
    scene.off(TileMap.Events.MAP_LOADED, this.syncBehaviors, this);
    scene.off('PortalFeatureComponent:entered', null, this);
    scene.off('TreasureFeatureComponent:entered', null, this);

    this._featureTypes.forEach((eventName: string) => {
      scene.off(eventName + ':entered', null, this);
      scene.off(eventName + ':exited', null, this);
    });
  }

  public _onClick(e: MouseEvent) {

    // Ignore clicks that did not originate on the canvas
    if (e.srcElement !== this.canvas) {
      return;
    }

    const pathComponent = this.scene.componentByType(PathComponent) as PathComponent;
    const playerComponent = this.scene.componentByType(PlayerComponent) as PlayerComponent;
    if (pathComponent && playerComponent) {
      PowInput.mouseOnView(e, this.mouse.view, this.mouse);
      playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint, this.mouse.world);
      e.preventDefault();
      return false;
    }
  }

  private _players: SceneObject[] = null;
  private _playerRenders: SceneObject[] = null;
  private _sprites: SpriteComponent[] = null;
  private _movers: MovableComponent[] = null;
  private _features: GameFeatureObject[] = null;

  syncComponents() {
    super.syncBehaviors();
    this.clearCache();
  }

  protected _renderables: any[] = [];

  protected clearCache() {
    this._players = null;
    this._playerRenders = null;
    this._sprites = null;
    this._movers = null;
    this._renderables = [];
    this._features = null;
  }

  /**
   * Render the tile map and any features it has.
   */
  renderFrame(elapsed: number) {
    super.renderFrame(elapsed);
    if (!this._features) {
      this._features = <GameFeatureObject[]> this.scene.objectsByType(GameFeatureObject);
      this._renderables = this._renderables.concat(this._features);
    }
    if (!this._playerRenders) {
      this._playerRenders = <SceneObject[]> this.scene.objectsByComponent(PlayerRenderComponent);
      this._renderables = this._renderables.concat(this._playerRenders);
    }
    if (!this._players) {
      this._players = <SceneObject[]> this.scene.objectsByComponent(PlayerComponent);
      this._renderables = this._renderables.concat(this._players);
    }
    if (!this._sprites) {
      this._sprites = <SpriteComponent[]> this.scene.componentsByType(SpriteComponent);
      this._renderables = this._renderables.concat(this._sprites);
    }
    let iterableLen: number = this._renderables.length;
    for (let i = 0; i < iterableLen; i++) {
      const renderObj: any = this._renderables[i];
      this.objectRenderer.render(renderObj, renderObj, this);
    }
    if (!this._movers) {
      this._movers = <MovableComponent[]> this.scene.componentsByType(MovableComponent);
    }
    iterableLen = this._movers.length;
    for (let j = 0; j < iterableLen; j++) {
      const target: MovableComponent = this._movers[j];
      if (target.path.length > 0) {
        this.context.save();
        const destination: Point = target.path[target.path.length - 1].clone();
        destination.x -= 0.5;
        destination.y -= 0.5;

        const screenTile: Rect = this.worldToScreen(new Rect(destination, new Point(1, 1)));
        this.context.fillStyle = this.targetFill;
        this.context.fillRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
        this.context.strokeStyle = this.targetStroke;
        this.context.lineWidth = this.targetStrokeWidth;
        this.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);

        this.context.restore();
      }
    }
    return this;
  }

  /**
   * Update the view based on changes to the underlying map and/or player.
   * @internal
   */
  private renderModel(map: GameTileMap, player: Entity) {
    const mapSet = !!(!this.map && map);
    const mapChanged = !!(this.map && map && this.map.map.url !== map.map.url);
    const removePlayer = () => {
      if (this._playerEntity$.value && this.scene) {
        this.scene.removeObject(this._playerEntity$.value);
      }
      this._playerEntity$.next(null);
    };
    if (mapChanged) {
      this.map.removeFeaturesFromScene();
      this.scene.removeObject(this.map);
      removePlayer();
      this.clearCache();
    }
    this.map = map;
    if (!map) {
      return;
    }
    if (mapChanged || mapSet) {
      this.scene.addObject(map);
      map.addFeaturesToScene();
      map.syncBehaviors();
    }
    if (player && !this._playerEntity$.value) {
      this.game.createPlayer(player, map).then((gamePlayer: GameEntityObject) => {
        this.scene.addObject(gamePlayer);
        this._playerEntity$.next(gamePlayer);
      });
    }
    else if (!player) {
      removePlayer();
    }
  }
}

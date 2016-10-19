import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {Notify} from '../../services/notify';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable, ReplaySubject, Subscription} from 'rxjs/Rx';
import {GameState} from '../../models/game-state/game-state.model';
import {GameTileMap} from '../../../game/gameTileMap';
import {PartyMember} from '../../models/party-member.model';
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
import {
  GameStateTravelAction,
  GameStateTravelSuccessAction,
  GameStateActionTypes
} from '../../models/game-state/game-state.actions';
import {TileMapView} from '../../../game/pow2/tile/tileMapView';
import {TileObjectRenderer} from '../../../game/pow2/tile/render/tileObjectRenderer';
import {Actions} from '@ngrx/effects';
import {replace} from '@ngrx/router-store';
import {getMap} from '../../models/game-state/game-state.reducer';

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

  @ViewChild("worldCanvas") canvasElementRef: ElementRef;

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
    .select((s) => s.gameState)
    .map((s: GameState) => {
      return Immutable.Map(s.position).toJS()
    })
    .distinctUntilChanged();

  /** Observable of PartyMember representing the party leader to be rendered in the world */
  partyLeader$: Observable<PartyMember> = this.store
    .select((s) => s.gameState.party)
    .map((party: PartyMember[]) => {
      return Immutable.Map(party[0]).toJS();
    });


  /** Update router URL when travel completes */
  changeRouteTravel$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL_SUCCESS)
    .distinctUntilChanged()
    .map((action: GameStateTravelSuccessAction) => {
      return replace(['world', action.payload]);
    });

  /** Load map and create player entity when the store changes */
  map$: Observable<GameTileMap> = getMap(this.store)
    .switchMap((map: string) => {
      return this.gameResources.loadMap(map);
    })
    .distinctUntilChanged();

  map: GameTileMap;

  /** The fill color to use when rendering a path target. */
  targetFill: string = "rgba(10,255,10,0.3)";
  /** The stroke to use when outlining path target. */
  targetStroke: string = "rgba(10,255,10,0.3)";
  /** Line width for the path target stroke. */
  targetStrokeWidth: number = 1.5;
  styleBackground: string = 'rgba(0,0,0,1)';

  objectRenderer: TileObjectRenderer = new TileObjectRenderer;
  mouse: NamedMouseElement = null;
  scene: Scene = new Scene();

  private _subscriptions: Subscription[] = [];

  constructor(public game: RPGGame,
              public actions$: Actions,
              public notify: Notify,
              public store: Store<AppState>,
              public gameResources: GameResources,
              public world: GameWorld) {
    super();
    this._subscriptions.push(this.map$.combineLatest(this.partyLeader$)
      .do((tuple: any) => {
        const map: GameTileMap = tuple[0];
        const player: PartyMember = tuple[1];
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
    this.world.mark(this.scene);
    this.canvas = this.canvasElementRef.nativeElement;
    this.camera.point.set(-0.5, -0.5);
    this.scene.addView(this);
    setTimeout(() => this._onResize(), 1);
  }

  private _playerObj: GameEntityObject = null;

  /**
   * The map view bounds in world space.
   */
  protected _bounds: Point = new Point();


  protected _onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._bounds.set(this.canvas.width, this.canvas.height);
    this._bounds = this.screenToWorld(this._bounds);
    var ctx: any = this.context;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    // Camera (window bounds)
    if (this.map) {
      var tileOffset = this.map.bounds.getCenter();
      var offset = this._bounds.clone().divide(2).multiply(-1).add(tileOffset);
      this.camera.point.set(offset.floor());
    }
    this.camera.extent.set(this._bounds);
  }

  //
  // ISceneView implementation
  //
  onAddToScene(scene: Scene) {
    this.clearCache();
    this.mouse = this.world.input.mouseHook(<SceneView>this, "world");
    this.scene.on(TileMap.Events.MAP_LOADED, this.syncComponents, this);

    // When a portal is entered, update the map view to reflect the change.
    this.scene.on('PortalFeatureComponent:entered', (data: any) => {
      this.store.dispatch(new GameStateTravelAction(data.map, data.target));
    }, this);

    this.scene.on('TreasureFeatureComponent:entered', (feature: any) => {
      if (typeof feature.gold !== 'undefined') {
        this.game.world.model.addGold(feature.gold);
        this.notify.show("You found " + feature.gold + " gold!", null, 0);
      }
      if (typeof feature.item === 'string') {
        var item = this.game.world.itemModelFromId(feature.item);
        if (!item) {
          return;
        }
        this.game.world.model.inventory.push(item);
        this.notify.show("You found " + item.get('name') + "!", null, 0);
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
    this.world.input.mouseUnhook("world");
    this.scene.off(TileMap.Events.MAP_LOADED, this.syncComponents, this);
    this.scene.off('PortalFeatureComponent:entered', null, this);
    this.scene.off('TreasureFeatureComponent:entered', null, this);

    this._featureTypes.forEach((eventName: string) => {
      scene.off(eventName + ':entered', null, this);
      scene.off(eventName + ':exited', null, this);
    });
  }

  private _onClick(e: MouseEvent) {

    // Ignore clicks that did not originate on the canvas
    if(e.srcElement !== this.canvas) {
      return;
    }

    var pathComponent = <PathComponent>this.scene.componentByType(PathComponent);
    var playerComponent = <PlayerComponent>this.scene.componentByType(PlayerComponent);
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
    super.syncComponents();
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
      this._features = <GameFeatureObject[]>this.scene.objectsByType(GameFeatureObject);
      this._renderables = this._renderables.concat(this._features);
    }
    if (!this._playerRenders) {
      this._playerRenders = <SceneObject[]>this.scene.objectsByComponent(PlayerRenderComponent);
      this._renderables = this._renderables.concat(this._playerRenders);
    }
    if (!this._players) {
      this._players = <SceneObject[]>this.scene.objectsByComponent(PlayerComponent);
      this._renderables = this._renderables.concat(this._players);
    }
    if (!this._sprites) {
      this._sprites = <SpriteComponent[]>this.scene.componentsByType(SpriteComponent);
      this._renderables = this._renderables.concat(this._sprites);
    }
    var l: number = this._renderables.length;
    for (var i = 0; i < l; i++) {
      var renderObj: any = this._renderables[i];
      this.objectRenderer.render(renderObj, renderObj, this);
    }
    if (!this._movers) {
      this._movers = <MovableComponent[]>this.scene.componentsByType(MovableComponent);
    }
    l = this._movers.length;
    for (var i = 0; i < l; i++) {
      var target: MovableComponent = this._movers[i];
      if (target.path.length > 0) {
        this.context.save();
        var destination: Point = target.path[target.path.length - 1].clone();
        destination.x -= 0.5;
        destination.y -= 0.5;

        var screenTile: Rect = this.worldToScreen(new Rect(destination, new Point(1, 1)));
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
  private renderModel(map: GameTileMap, player: PartyMember) {
    if (this.map) {
      this.map.removeFeaturesFromScene();
      this.scene.removeObject(this.map);
    }
    this.map = map;
    this.clearCache();
    if (!map) {
      return;
    }
    this.scene.addObject(map);
    map.addFeaturesToScene();
    map.syncComponents();
    if (player) {
      this.game.createPlayer(player, map).then((player: GameEntityObject) => {
        // Remove existing instances if called multiple times
        if (this._playerObj) {
          this.scene.removeObject(this._playerObj);
        }
        this._playerObj = player;
        // Add new valid instances to the scene
        if (player) {
          this.scene.addObject(player);
        }
      });
    }
  }
}

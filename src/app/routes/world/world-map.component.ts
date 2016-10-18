/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import * as _ from 'underscore';
import {Component, ElementRef, Input, AfterViewInit, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {GameTileMap} from '../../../game/gameTileMap';
import {TileObjectRenderer} from '../../../game/pow2/tile/render/tileObjectRenderer';
import {NamedMouseElement, PowInput} from '../../../game/pow2/core/input';
import {Scene} from '../../../game/pow2/scene/scene';
import {RPGGame} from '../../services/rpgGame';
import {Notify} from '../../services/notify';
import {HeroModel} from '../../../game/rpg/models/heroModel';
import {Point} from '../../../game/pow-core/point';
import {SceneView} from '../../../game/pow2/scene/sceneView';
import {TileMap} from '../../../game/pow2/tile/tileMap';
import {PathComponent} from '../../../game/pow2/tile/components/pathComponent';
import {PlayerComponent} from '../../../game/rpg/components/playerComponent';
import {SceneObject} from '../../../game/pow2/scene/sceneObject';
import {SpriteComponent} from '../../../game/pow2/tile/components/spriteComponent';
import {MovableComponent} from '../../../game/pow2/scene/components/movableComponent';
import {GameFeatureObject} from '../../../game/rpg/objects/gameFeatureObject';
import {Rect} from '../../../game/pow-core/rect';
import {PlayerRenderComponent} from '../../../game/pow2/game/components/playerRenderComponent';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {GameStateTravelAction} from '../../models/game-state/game-state.actions';
import {TileMapView} from '../../../game/pow2/tile/tileMapView';
import {GameWorld} from '../../services/gameWorld';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';

@Component({
  selector: 'world-map',
  template: `
  <canvas>
    Your browser doesn't support this.
  </canvas>
  `,
  host: {
    '(window:resize)': '_onResize($event)',
    '(click)': '_onClick($event)',
    '[style.color]': 'styleBackground'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMap extends TileMapView implements AfterViewInit, OnInit, OnDestroy {


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

  get map(): GameTileMap {
    return this._map;
  }

  @Input()
  set map(value: GameTileMap) {
    this._changeMap(value);
  }

  private _map: GameTileMap;


  constructor(public elRef: ElementRef,
              public game: RPGGame,
              public world: GameWorld,
              public store: Store<AppState>,
              public notify: Notify) {
    super();
  }

  ngOnInit(): void {
    this.world.mark(this.scene);
  }

  ngOnDestroy(): void {
    this.world.erase(this.scene);
  }


  ngAfterViewInit(): void {
    this.canvas = this.elRef.nativeElement.querySelector('canvas');
    this.camera.point.set(-0.5, -0.5);
    this.scene.addView(this);
    _.defer(() => this._onResize());

    // When a portal is entered, update the map view to reflect the change.
    this.scene.on('portal:entered', (data: any) => {
      // this._loadMap(data.map).then(()=> {
      //   this.game.partyMapName = data.map;
      //   this.game.partyPosition = data.target;

      // TODO: Express the portal enter as something other than an event? Then express this as an effect?
      this.store.dispatch(new GameStateTravelAction(data.map, data.target));

      //   this.game.world.model.setKeyData('playerMap', data.map);
      //   this.game.world.model.setKeyData('playerPosition', data.target);
      // }).catch(console.error.bind(console));
    });

    this.scene.on('treasure:entered', (feature: any) => {
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
    });
  }

  private _changeMap(map: GameTileMap) {
    // Release any exist map resource
    if (this._map) {
      this._map.removeFeaturesFromScene();
      this.scene.removeObject(this._map);
    }
    this._map = map;
    this.clearCache();
    if (!this._map) {
      return;
    }
    this.scene.addObject(this._map);
    this._map.addFeaturesToScene();
    if (this._player) {
      this.game.createPlayer(this._player, this._map);
    }
    this._map.syncComponents();
  }

  private _playerObj: GameEntityObject = null;
  private _player: HeroModel = null;
  @Input()
  set player(value: HeroModel) {
    this._player = value;
    if (!this._player || !this._map) {
      return;
    }
    // Create a player entity
    this.game.createPlayer(this._player, this._map)
      .then((player: GameEntityObject) => {
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

  get player(): HeroModel {
    return this._player;
  }

  private _position = new Point();
  @Input()
  set position(value: Point) {
    this._position.set(value.x, value.y);
    if (this._playerObj) {
      this._playerObj.setPoint(value);
    }
  }

  get position() {
    return this._position;
  }

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
    if (this._map) {
      var tileOffset = this._map.bounds.getCenter();
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
  }

  onRemoveFromScene(scene: Scene) {
    this.clearCache();
    this.world.input.mouseUnhook("world");
    this.scene.off(TileMap.Events.MAP_LOADED, this.syncComponents, this);
  }

  private _onClick(e: any) {
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


}

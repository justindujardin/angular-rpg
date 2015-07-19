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

import {Component, View, bootstrap,ElementRef} from 'angular2/angular2';

import {GameWorld} from '../../gameWorld';
import {GameTileMap} from '../../gameTileMap';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {GameFeatureObject} from '../../objects/gameFeatureObject';
import {GameStateMachine} from '../../states/gameStateMachine';

import {GameStateModel} from '../../models/gameStateModel';
import {HeroModel,HeroTypes, WeaponModel, ArmorModel,ItemModel} from '../../models/all';

import {RPGGame,Notify} from '../services/all';
import {Map} from '../map';

@Component({
  selector: 'world-map',
  properties: ['mapName', 'player', 'playerPosition'],
  host: {
    '(window:resize)': '_onResize($event)'
  }
})
@View({
  template: `
  <canvas>
    Your browser doesn't support this.
  </canvas>
  `,
  host: {
    '[style.color]': 'styleBackground'
  }
})
export class WorldMap extends Map {
  styleBackground:string = 'rgba(0,0,0,1)';
  tileMap:GameTileMap = null;

  objectRenderer:pow2.tile.render.TileObjectRenderer = new pow2.tile.render.TileObjectRenderer;
  mouse:pow2.NamedMouseElement = null;
  scene:pow2.scene.Scene;

  /**
   * The fill color to use when rendering a path target.
   */
  targetFill:string = "rgba(10,255,10,0.3)";
  /**
   * The stroke to use when outlining path target.
   */
  targetStroke:string = "rgba(10,255,10,0.3)";
  /**
   * Line width for the path target stroke.
   */
  targetStrokeWidth:number = 1.5;

  constructor(public elRef:ElementRef, public game:RPGGame, public notify:Notify) {
    super(elRef, game);
    this.mouseClick = _.bind(this.mouseClick, this);
    this.camera.point.set(-0.5, -0.5);
    game.world.scene.addView(this);
    _.defer(() => this._onResize());

    // When a portal is entered, update the map view to reflect the change.
    game.world.scene.on('portal:entered', (data:any) => {
      this._loadMap(data.map).then(()=> {
        game.partyMapName = data.map;
        game.partyPosition = data.target;
        game.world.model.setKeyData('playerMap', data.map);
        game.world.model.setKeyData('playerPosition', data.target);
      }).catch(console.error.bind(console));
    });

    game.world.scene.on('treasure:entered', (feature:any) => {
      if (typeof feature.gold !== 'undefined') {
        game.world.model.addGold(feature.gold);
        this.notify.show("You found " + feature.gold + " gold!", null, 0);
      }
      if (typeof feature.item === 'string') {
        var item = game.world.itemModelFromId(feature.item);
        if (!item) {
          return;
        }
        game.world.model.inventory.push(item);
        this.notify.show("You found " + item.get('name') + "!", null, 0);
      }
    });

  }

  protected _onMapLoaded(map:GameTileMap) {
    map.buildFeatures();
    if (this._player) {
      this.game.createPlayer(this._player, this.tileMap);
    }
    this.clearCache();
    this._onResize();
    this.tileMap.syncComponents();
  }

  private _player:HeroModel = null;
  set player(value:HeroModel) {
    this._player = value;
    if (this.tileMap) {
      this.game.createPlayer(this._player, this.tileMap);
    }
  }

  get player():HeroModel {
    return this._player;
  }

  private _position = new pow2.Point();
  set position(value:pow2.Point) {
    this._position.set(value);
    if (this.game.sprite) {
      this.game.sprite.setPoint(value);
    }
  }

  get position() {
    return this._position;
  }

  protected _onResize() {
    super._onResize();
    // TileMap
    // Camera (window bounds)
    if (this.tileMap) {
      var tileOffset = this.tileMap.bounds.getCenter();
      var offset = this._bounds.clone().divide(2).multiply(-1).add(tileOffset);
      this.camera.point.set(offset.floor());
    }
    this.camera.extent.set(this._bounds);
  }

  //
  // ISceneView implementation
  //
  onAddToScene(scene:pow2.scene.Scene) {
    this.clearCache();
    super.onAddToScene(scene);
    this.mouse = scene.world.input.mouseHook(<pow2.scene.SceneView>this, "world");
    // TODO: Move this elsewhere.
    this.$el.on('click touchstart', this.mouseClick);
    this.scene.on(pow2.tile.TileMap.Events.MAP_LOADED, this.syncComponents, this);
  }

  onRemoveFromScene(scene:pow2.scene.Scene) {
    this.clearCache();
    scene.world.input.mouseUnhook("world");
    this.$el.off('click', this.mouseClick);
    this.scene.off(pow2.tile.TileMap.Events.MAP_LOADED, this.syncComponents, this);
  }

  mouseClick(e:any) {
    var pathComponent = <pow2.tile.components.PathComponent>this.scene.componentByType(pow2.tile.components.PathComponent);
    var playerComponent = <pow2.scene.components.PlayerComponent>this.scene.componentByType(pow2.scene.components.PlayerComponent);
    if (pathComponent && playerComponent) {
      pow2.Input.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
      playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint, this.mouse.world);
      e.preventDefault();
      return false;
    }
  }

  private _players:pow2.scene.SceneObject[] = null;
  private _playerRenders:pow2.scene.SceneObject[] = null;
  private _sprites:pow2.tile.components.SpriteComponent[] = null;
  private _movers:pow2.scene.components.MovableComponent[] = null;
  private _features:GameFeatureObject[] = null;

  syncComponents() {
    super.syncComponents();
    this.clearCache();
  }

  protected _renderables:any[] = [];

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
  renderFrame(elapsed:number) {
    super.renderFrame(elapsed);
    if (!this._features) {
      this._features = <GameFeatureObject[]>this.scene.objectsByType(GameFeatureObject);
      this._renderables = this._renderables.concat(this._features);
    }
    if (!this._playerRenders) {
      this._playerRenders = <pow2.scene.SceneObject[]>this.scene.objectsByComponent(pow2.game.components.PlayerRenderComponent);
      this._renderables = this._renderables.concat(this._playerRenders);
    }
    if (!this._players) {
      this._players = <pow2.scene.SceneObject[]>this.scene.objectsByComponent(pow2.scene.components.PlayerComponent);
      this._renderables = this._renderables.concat(this._players);
    }
    if (!this._sprites) {
      this._sprites = <pow2.tile.components.SpriteComponent[]>this.scene.componentsByType(pow2.tile.components.SpriteComponent);
      this._renderables = this._renderables.concat(this._sprites);
    }
    var l:number = this._renderables.length;
    for (var i = 0; i < l; i++) {
      var renderObj:any = this._renderables[i];
      this.objectRenderer.render(renderObj, renderObj, this);
    }
    if (!this._movers) {
      this._movers = <pow2.scene.components.MovableComponent[]>this.scene.componentsByType(pow2.scene.components.MovableComponent);
    }
    l = this._movers.length;
    for (var i = 0; i < l; i++) {
      var target:pow2.scene.components.MovableComponent = this._movers[i];
      if (target.path.length > 0) {
        this.context.save();
        var destination:pow2.Point = target.path[target.path.length - 1].clone();
        destination.x -= 0.5;
        destination.y -= 0.5;

        var screenTile:pow2.Rect = this.worldToScreen(new pow2.Rect(destination, new pow2.Point(1, 1)));
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

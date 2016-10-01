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

import {TileObjectRenderer} from '../tile/render/tileObjectRenderer';
import {TileMapView} from '../tile/tileMapView';
import {NamedMouseElement, PowInput} from '../core/input';
import {Scene} from '../scene/scene';
import {SceneView} from '../scene/sceneView';
import {TileMap} from '../tile/tileMap';
import {PathComponent} from '../tile/components/pathComponent';
import {PlayerComponent} from '../../rpg/components/playerComponent';
import {SceneObject} from '../scene/sceneObject';
import {SpriteComponent} from '../tile/components/spriteComponent';
import {MovableComponent} from '../scene/components/movableComponent';
import {PlayerRenderComponent} from './components/playerRenderComponent';
import {Point} from '../../pow-core/point';
import {Rect} from '../../pow-core/rect';
export class GameMapView extends TileMapView {
  objectRenderer: TileObjectRenderer = new TileObjectRenderer;
  mouse: NamedMouseElement = null;
  scene: Scene;

  /**
   * The fill color to use when rendering a path target.
   */
  targetFill: string = "rgba(10,255,10,0.3)";
  /**
   * The stroke to use when outlining path target.
   */
  targetStroke: string = "rgba(10,255,10,0.3)";
  /**
   * Line width for the path target stroke.
   */
  targetStrokeWidth: number = 1.5;

  constructor(canvas: HTMLCanvasElement, loader: any) {
    super(canvas, loader);
    this.mouseClick = _.bind(this.mouseClick, this);
  }

  onAddToScene(scene: Scene) {
    this.clearCache();
    super.onAddToScene(scene);
    this.mouse = scene.world.input.mouseHook(<SceneView>this, "world");
    // TODO: Move this elsewhere.
    this.$el.on('click touchstart', this.mouseClick);
    this.scene.on(TileMap.Events.MAP_LOADED, this.syncComponents, this);
  }

  onRemoveFromScene(scene: Scene) {
    this.clearCache();
    scene.world.input.mouseUnhook("world");
    this.$el.off('click', this.mouseClick);
    this.scene.off(TileMap.Events.MAP_LOADED, this.syncComponents, this);
  }


  /*
   * Mouse input
   */
  mouseClick(e: any) {
    var pathComponent = <PathComponent>this.scene.componentByType(PathComponent);
    var playerComponent = <PlayerComponent>this.scene.componentByType(PlayerComponent);
    if (pathComponent && playerComponent) {
      PowInput.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
      playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint, this.mouse.world);
      e.preventDefault();
      return false;
    }
  }

  private _players: SceneObject[] = null;
  private _playerRenders: SceneObject[] = null;
  private _sprites: SpriteComponent[] = null;
  private _movers: MovableComponent[] = null;

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
  }

  /*
   * Render the tile map, and any features it has.
   */
  renderFrame(elapsed) {
    super.renderFrame(elapsed);
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

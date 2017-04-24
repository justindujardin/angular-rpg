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
import {SceneView} from '../scene/scene-view';
import {TileMapRenderer} from './render/tile-map-renderer';
import {TileMap} from './tile-map';
import {IRect} from '../../pow-core/rect';
import {CameraBehavior} from '../scene/behaviors/camera-behavior';
import {Point} from '../../pow-core';

export class TileMapView extends SceneView {
  mapRenderer: TileMapRenderer = new TileMapRenderer();
  map: TileMap;

  /**
   * The map view bounds in world space.
   */
  protected _bounds: Point = new Point();

  public _onResize(event?: Event) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._bounds.set(this.canvas.width, this.canvas.height);
    this._bounds = this.screenToWorld(this._bounds);
    const context: any = this.context;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
  }

  /*
   * Get the camera clip rectangle.
   * @returns {Rect}
   */
  getCameraClip() {
    if (!this.map) {
      return this.camera;
    }
    const clipGrow = this.camera.clone();
    clipGrow.point.round();
    clipGrow.extent.round();

    // Clamp to tilemap bounds.
    const rect: IRect = this.map.bounds;
    if (clipGrow.point.x < rect.point.x) {
      clipGrow.point.x += rect.point.x - clipGrow.point.x;
    }
    if (clipGrow.point.y < rect.point.y) {
      clipGrow.point.y += rect.point.y - clipGrow.point.y;
    }
    if (clipGrow.point.x + clipGrow.extent.x > rect.point.x + rect.extent.x) {
      clipGrow.point.x -= ((clipGrow.point.x + clipGrow.extent.x) - (rect.point.x + rect.extent.x));
    }
    if (clipGrow.point.y + clipGrow.extent.y > rect.point.y + rect.extent.y) {
      clipGrow.point.y -= ((clipGrow.point.y + clipGrow.extent.y) - (rect.point.y + rect.extent.y));
    }
    return clipGrow;
  }

  /*
   * Update the camera for this frame.
   */
  processCamera() {
    this.cameraComponent = this.findBehavior(CameraBehavior) as CameraBehavior;
    if (!this.cameraComponent && this.map) {
      this.cameraComponent = this.map.findBehavior(CameraBehavior) as CameraBehavior;
    }
    if (!this.cameraComponent) {
      this.cameraComponent = this.scene.componentByType(CameraBehavior) as CameraBehavior;
    }
    super.processCamera();
  }

  /*
   * Set the pre-render canvas state.
   */
  setRenderState() {
    super.setRenderState();
    if (!this.camera || !this.context || !this.map) {
      return;
    }
    let worldCameraPos = this.worldToScreen(this.camera.point);
    let worldTilePos = this.worldToScreen(this.map.bounds.point);
    worldTilePos.x = parseFloat(worldTilePos.x.toFixed(2));
    worldTilePos.y = parseFloat(worldTilePos.y.toFixed(2));
    worldCameraPos.x = parseFloat(worldCameraPos.x.toFixed(2));
    worldCameraPos.y = parseFloat(worldCameraPos.y.toFixed(2));
    this.context.translate(worldTilePos.x - worldCameraPos.x, worldTilePos.y - worldCameraPos.y);
  }

  /*
   * Render the tile $map, and any features it has.
   */
  renderFrame(elapsed: number) {
    this.clearRect();
    if (!this.map) {
      return;
    }
    this.mapRenderer.render(this.map, this);
    return this;
  }

  /**
   * Draw any post-frame rendering effects.
   */
  renderPost() {
    // nothing
  }
}

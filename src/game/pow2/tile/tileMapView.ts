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

import {SceneView} from '../scene/sceneView';
import {TileMapRenderer} from './render/tileMapRenderer';
import {TileMap} from './tileMap';
import {Scene} from '../scene/scene';
import {IRect} from '../../pow-core/rect';
import {CameraComponent} from '../scene/components/cameraComponent';
export class TileMapView extends SceneView {
  mapRenderer: TileMapRenderer = new TileMapRenderer;
  map: TileMap;

  setTileMap(tileMap: TileMap) {
    this.map = tileMap;
  }

  setScene(scene: Scene) {
    if (scene === this.scene) {
      return;
    }
    this.cameraComponent = null;
    super.setScene(scene);
  }

  /*
   * Get the camera clip rectangle.
   * @returns {Rect}
   */
  getCameraClip() {
    if (!this.map) {
      return this.camera;
    }
    var clipGrow = this.camera.clone();
    clipGrow.point.round();
    clipGrow.extent.round();

    // Clamp to tilemap bounds.
    var rect: IRect = this.map.bounds;
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
    this.cameraComponent = <CameraComponent>this.findComponent(CameraComponent);
    if (!this.cameraComponent && this.map) {
      this.cameraComponent = <CameraComponent>this.map.findComponent(CameraComponent);
    }
    if (!this.cameraComponent) {
      this.cameraComponent = <CameraComponent>this.scene.componentByType(CameraComponent);
    }
    super.processCamera();
  }

  /*
   * Set the pre-render canvas state.
   */
  setRenderState() {
    var worldCameraPos, worldTilePos;
    super.setRenderState();
    if (!this.camera || !this.context || !this.map) {
      return;
    }
    worldTilePos = this.worldToScreen(this.map.bounds.point);
    worldTilePos.x = parseFloat(worldTilePos.x.toFixed(2));
    worldTilePos.y = parseFloat(worldTilePos.y.toFixed(2));
    worldCameraPos = this.worldToScreen(this.camera.point);
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

  /*
   * Draw any post-rendering effects.
   */
  renderPost() {
  }
}

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
import {CameraBehavior} from '../../scene/behaviors/camera-behavior';
import {TileMap} from '../tile-map';
import {SceneView} from '../../scene/scene-view';
export class TileMapCameraComponent extends CameraBehavior {
  host: TileMap;

  connectBehavior(): boolean {
    return super.connectBehavior() && this.host instanceof TileMap;
  }

  process(view: SceneView) {
    view.camera.point.set(this.host.bounds.point);
    view.cameraScale = Math.min(6, Math.round(view.screenToWorld(view.context.canvas.width) / view.camera.extent.x));

    // Clamp to tile map if it is present.
    if (this.host) {
      view.camera.point.x = Math.max(0, view.camera.point.x);
      view.camera.point.y = Math.max(0, view.camera.point.y);
      view.camera.point.x = Math.min(view.camera.point.x, this.host.bounds.extent.x - view.camera.extent.x);
      view.camera.point.y = Math.min(view.camera.point.y, this.host.bounds.extent.y - view.camera.extent.y);

      // Center in viewport if tilemap is smaller than camera.
      if (this.host.bounds.extent.x < view.camera.extent.x) {
        view.camera.point.x = (this.host.bounds.extent.x - view.camera.extent.x) / 2;
      }
      if (this.host.bounds.extent.y < view.camera.extent.y) {
        view.camera.point.y = (this.host.bounds.extent.y - view.camera.extent.y) / 2;
      }
    }
  }
}

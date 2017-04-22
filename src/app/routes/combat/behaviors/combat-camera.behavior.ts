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
import {CameraBehavior} from '../../../../game/pow2/scene/behaviors/camera-behavior';
import {GameTileMap} from '../../../scene/game-tile-map';
import {SceneView} from '../../../../game/pow2/scene/scene-view';
import {Rect} from '../../../../game/pow-core/rect';
import {Component} from '@angular/core';

@Component({
  selector: 'combat-camera-behavior',
  template: `<ng-content></ng-content>`
})
export class CombatCameraBehaviorComponent extends CameraBehavior {
  host: GameTileMap;

  connectBehavior(): boolean {
    return super.connectBehavior() && this.host instanceof GameTileMap;
  }

  process(view: SceneView) {
    if (!this.host) {
      super.process(view);
      return;
    }
    const w: number = view.context.canvas.width;
    const screenRect = new Rect(0, 0, view.context.canvas.width, view.context.canvas.height);
    view.cameraScale = w > 1024 ? 6 : (w > 768 ? 4 : (w > 480 ? 3 : 2));
    view.camera = view.screenToWorld(screenRect, view.cameraScale);
    view.camera.point.x = (this.host.bounds.extent.x / 2) - (view.camera.extent.x / 2);
  }
}

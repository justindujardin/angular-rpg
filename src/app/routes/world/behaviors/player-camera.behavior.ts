import { Component } from '@angular/core';
import { Point } from '../../../../app/core/point';
import { CameraBehavior } from '../../../behaviors/camera-behavior';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { SceneView } from '../../../scene/scene-view';

@Component({
  selector: 'player-camera-behavior',
  template: `<ng-content></ng-content>`,
})
export class PlayerCameraBehaviorComponent extends CameraBehavior {
  host: GameEntityObject;

  process(view: SceneView) {
    if (!view.context) {
      return;
    }
    const w: number = view.context.canvas.width;
    view.camera.point.set(this.host.point);
    view.cameraScale = w > 1024 ? 6 : w > 768 ? 4 : w > 480 ? 3 : 2;
    const screenRect = new Point(view.context.canvas.width, view.context.canvas.height);
    const canvasSize = view.screenToWorld(screenRect, view.cameraScale);
    view.camera.extent.set(canvasSize);

    // Center on player object
    view.camera.setCenter(this.host.renderPoint || this.host.point);
    view.focusPoint.set(this.host.renderPoint || this.host.point);

    // Clamp to tile map if it is present.
    if (this.host.tileMap) {
      view.camera.point.x = Math.min(
        view.camera.point.x,
        this.host.tileMap.bounds.extent.x - view.camera.extent.x,
      );
      view.camera.point.y = Math.min(
        view.camera.point.y,
        this.host.tileMap.bounds.extent.y - view.camera.extent.y,
      );
      view.camera.point.x = Math.max(0, view.camera.point.x);
      view.camera.point.y = Math.max(0, view.camera.point.y);

      // Center in viewport if tilemap is smaller than camera.
      if (this.host.tileMap.bounds.extent.x < view.camera.extent.x) {
        view.camera.point.x =
          (this.host.tileMap.bounds.extent.x - view.camera.extent.x) / 2;
      }
      if (this.host.tileMap.bounds.extent.y < view.camera.extent.y) {
        view.camera.point.y =
          (this.host.tileMap.bounds.extent.y - view.camera.extent.y) / 2;
      }
    }
  }
}


import { Point } from '../../app/core/point';
import { SceneView } from '../scene/scene-view';
import { SceneObjectBehavior } from './scene-object-behavior';

export class CameraBehavior extends SceneObjectBehavior {
  process(view: SceneView) {
    if (!view.context || !this.host) {
      return;
    }
    view.camera.point.set(this.host.point);
    view.cameraScale = view.context.canvas.width > 768 ? 4 : 2;
    const screenPoint = new Point(
      view.context.canvas.width,
      view.context.canvas.height
    );
    const canvasSize = view.screenToWorld(screenPoint, view.cameraScale);
    view.camera.extent.set(canvasSize);
  }
}

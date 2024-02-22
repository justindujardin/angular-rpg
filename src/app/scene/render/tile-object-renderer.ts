import { IPoint, Point } from '../../core';
import { ISpriteMeta } from '../../core/api';
import { SceneView } from '../scene-view';

export interface TileRenderable {
  icon?: string;
  image: HTMLImageElement | null;
  visible: boolean;
  scale?: number;
  frame: number;
  rotation?: number;
  meta: ISpriteMeta | null;
}
export class TileObjectRenderer {
  private _renderPoint: Point = new Point();

  render(object: TileRenderable, at: IPoint, view: SceneView) {
    if (!object || object.visible === false || !object.image || !view.context) {
      return;
    }

    // Build render data.
    this._renderPoint.set(at);
    const point = this._renderPoint;
    let sourceWidth: number = view.unitSize;
    let sourceHeight: number = view.unitSize;
    if (
      object.meta &&
      typeof object.meta.cellWidth !== 'undefined' &&
      typeof object.meta.cellHeight !== 'undefined'
    ) {
      sourceWidth = object.meta.cellWidth;
      sourceHeight = object.meta.cellHeight;
    }
    const scale = typeof object.scale !== 'undefined' ? object.scale : 1;
    view.fastWorldToScreenPoint(point, point);
    // Offset position and floor to align on pixel boundaries
    point.subtract((sourceWidth * scale) / 2, (sourceHeight * scale) / 2).floor();

    // Context transformation for rotation
    if (object.rotation) {
      view.context.save(); // Save the current state
      // Move to the center of where the object should be drawn, then rotate
      view.context.translate(
        point.x - 1.5 + (sourceWidth * scale) / 2,
        point.y + (sourceHeight * scale) / 2,
      );
      view.context.rotate(object.rotation);
      // Move back to the top-left of the object, taking into account the scaling
      view.context.translate(-(sourceWidth * scale) / 2, -(sourceHeight * scale) / 2);
    }

    // Determine source x,y for sprites with frames
    let cx = 0;
    let cy = 0;
    const drawX = object.rotation ? -sourceWidth / 2 : point.x;
    const drawY = object.rotation ? -sourceHeight / 2 : point.y;

    if (object.icon && object.meta) {
      cx = object.meta.x;
      cy = object.meta.y;
      if (object.meta.frames > 1) {
        const cwidth = object.meta.width / sourceWidth;
        const fx = object.frame % cwidth;
        const fy = Math.floor((object.frame - fx) / cwidth);
        cx += fx * sourceWidth;
        cy += fy * sourceHeight;
      }
      view.context.drawImage(
        object.image,
        cx,
        cy,
        sourceWidth,
        sourceHeight,
        drawX,
        drawY,
        sourceWidth * scale,
        sourceHeight * scale,
      );
    } else {
      view.context.drawImage(
        object.image,
        drawX,
        drawY,
        sourceWidth * scale,
        sourceHeight * scale,
      );
    }

    if (object.rotation) {
      view.context.restore();
    }
  }
}

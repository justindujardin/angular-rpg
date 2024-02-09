

import { IPoint, Point } from '../../core';
import { ISpriteMeta } from '../../core/api';
import { SceneView } from '../scene-view';

export interface TileRenderable {
  icon?: string;
  image: HTMLImageElement | null;
  visible: boolean;
  scale?: number;
  frame: number;
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

    if (object.icon && object.meta) {
      let cx = object.meta.x;
      let cy = object.meta.y;
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
        point.x,
        point.y,
        sourceWidth * scale,
        sourceHeight * scale
      );
    } else {
      view.context.drawImage(
        object.image,
        point.x,
        point.y,
        sourceWidth * scale,
        sourceHeight * scale
      );
    }
  }
}

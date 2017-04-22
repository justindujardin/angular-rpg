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
import {IPoint, Point} from '../../../pow-core/point';
import {SceneView} from '../../scene/scene-view';
import {ISpriteMeta} from '../../core/api';

export interface TileRenderable {
  icon: string;
  image: HTMLImageElement;
  visible: boolean;
  scale: number;
  frame: number;
}

export class TileObjectRenderer {
  private _renderPoint: Point = new Point();

  render(object: TileRenderable, at: IPoint, view: SceneView, spriteMeta?: ISpriteMeta) {

    if (!object || object.visible === false || !object.image) {
      return;
    }

    // Build render data.
    this._renderPoint.set(at);
    const point = this._renderPoint;
    let sourceWidth: number = view.unitSize;
    let sourceHeight: number = view.unitSize;
    if (spriteMeta && typeof spriteMeta.cellWidth !== 'undefined' && typeof spriteMeta.cellHeight !== 'undefined') {
      sourceWidth = spriteMeta.cellWidth;
      sourceHeight = spriteMeta.cellHeight;
    }
    const objWidth = view.fastScreenToWorldNumber(sourceWidth);
    const objHeight = view.fastScreenToWorldNumber(sourceHeight);
    point.x -= objWidth * object.scale / 2;
    point.y -= objHeight * object.scale / 2;
    view.fastWorldToScreenPoint(point, point);

    if (object.icon && spriteMeta) {
      let cx = spriteMeta.x;
      let cy = spriteMeta.y;
      if (spriteMeta.frames > 1) {
        const cwidth = spriteMeta.width / sourceWidth;
        const fx = (object.frame % (cwidth));
        const fy = Math.floor((object.frame - fx) / cwidth);
        cx += fx * sourceWidth;
        cy += fy * sourceHeight;
      }
      view.context.drawImage(object.image, cx, cy, sourceWidth, sourceHeight,
        point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
    }
    else {
      view.context.drawImage(object.image, point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
    }
  }
}

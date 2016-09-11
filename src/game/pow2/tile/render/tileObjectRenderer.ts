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

import {SceneObjectRenderer} from '../../scene/sceneObjectRenderer';
import {Point} from '../../../pow-core/point';
import {SceneView} from '../../scene/sceneView';
export class TileObjectRenderer extends SceneObjectRenderer {
  private _renderPoint: Point = new Point();

  render(object: any, data: any, view: SceneView) { // TODO: typedef

    if (!data.image || !object.visible) {
      return;
    }

    // Build render data.
    this._renderPoint.set(object.renderPoint || object.point);
    var point = this._renderPoint;
    var c = data.meta; // TODO: interface this
    var sourceWidth: number = view.unitSize;
    var sourceHeight: number = view.unitSize;
    if (c && typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
      sourceWidth = c.cellWidth;
      sourceHeight = c.cellHeight;
    }
    var objWidth = view.fastScreenToWorldNumber(sourceWidth);
    var objHeight = view.fastScreenToWorldNumber(sourceHeight);
    point.x -= objWidth * object.scale / 2;
    point.y -= objHeight * object.scale / 2;
    view.fastWorldToScreenPoint(point, point);

    if (data.icon && data.meta) {
      var cx = c.x;
      var cy = c.y;
      if (data.meta.frames > 1) {
        var cwidth = c.width / sourceWidth;
        var fx = (data.frame % (cwidth));
        var fy = Math.floor((data.frame - fx) / cwidth);
        cx += fx * sourceWidth;
        cy += fy * sourceHeight;
      }
      view.context.drawImage(data.image, cx, cy, sourceWidth, sourceHeight, point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
    } else {
      view.context.drawImage(data.image, point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
    }
  }
}

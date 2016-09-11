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
import {Rect} from '../../../pow-core/rect';
import {TileMap} from '../tileMap';
import {TileMapView} from '../tileMapView';
import {ITiledLayer, ITileInstanceMeta} from '../../../pow-core/resources/tiled/tiled';
export class TileMapRenderer extends SceneObjectRenderer {
  buffer: HTMLCanvasElement[][] = null; // A 2d grid of rendered canvas textures.
  bufferMapName: string = null; // The name of the rendered map.  If the map name changes, the buffer is re-rendered.
  bufferComplete: boolean = false; // True if the entire map was rendered with all textures loaded and ready.

  private _clipRect: Rect = new Rect();
  private _renderRect: Rect = new Rect();

  // TODO: only render tiles that are in the clipRect.  This can be expensive at initial
  // load for expansive maps like the Browser Quest tmx.
  render(object: TileMap, view: TileMapView) {
    var squareUnits = 8;
    var squareSize = squareUnits * view.unitSize;
    if (!object.isLoaded()) {
      return;
    }
    if (object.dirtyLayers) {
      object.dirtyLayers = false;
      this.buffer = null;
      this.bufferComplete = false;
    }
    if (!this.bufferComplete || this.buffer === null || this.bufferMapName === null || this.bufferMapName !== object.map.url) {
      var tileUnitSize = squareSize / view.unitSize;
      // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
      var columns = Math.ceil(object.bounds.extent.x / squareUnits);
      var rows = Math.ceil(object.bounds.extent.y / squareUnits);
      this.buffer = new Array(columns);
      for (var col: number = 0; col < columns; col++) {
        this.buffer[col] = new Array(rows);
      }
      this.bufferComplete = true;
      var layers: ITiledLayer[] = object.getLayers();
      for (var col: number = 0; col < columns; col++) {
        for (var row: number = 0; row < rows; row++) {
          var xOffset = col * tileUnitSize;
          var xEnd = xOffset + tileUnitSize;
          var yOffset = row * tileUnitSize;
          var yEnd = yOffset + tileUnitSize;
          this.buffer[col][row] = view.renderToCanvas(squareSize, squareSize, (ctx) => {
            for (var x = xOffset; x < xEnd; x++) {
              for (var y = yOffset; y < yEnd; y++) {

                // Each layer
                _.each(layers, (l: ITiledLayer) => {
                  if (!l.visible) {
                    return;
                  }
                  var gid: number = object.getTileGid(l.name, x, y);
                  var meta: ITileInstanceMeta = object.getTileMeta(gid);
                  if (meta) {
                    var image: HTMLImageElement = (<any>meta.image).data;
                    // Keep this inline to avoid more function calls.
                    var dstH, dstW, dstX, dstY, srcH, srcW, srcX, srcY;
                    if (!image || !image.complete) {
                      this.bufferComplete = false;
                      return;
                    }
                    srcX = meta.x;
                    srcY = meta.y;
                    srcW = meta.width;
                    srcH = meta.height;
                    dstX = (x - xOffset) * view.unitSize;
                    dstY = (y - yOffset) * view.unitSize;
                    dstW = dstH = view.unitSize;
                    ctx.drawImage(image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
                  }
                });
              }
            }
            // Append chunks to body (DEBUG HACKS)

            // var dataImage = new Image();
            // dataImage.src = ctx.canvas.toDataURL();
            // $('body').append(dataImage);
          });
        }
      }
      this.bufferMapName = object.map.url;
    }
    var squareScreen = view.fastWorldToScreenNumber(squareUnits);

    view.fastWorldToScreenRect(view.getCameraClip(), this._clipRect);
    var cols: number = this.buffer.length;
    var rows: number = this.buffer[0].length;
    // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
    for (var col: number = 0; col < cols; col++) {
      for (var row: number = 0; row < rows; row++) {
        this._renderRect.set(col * squareUnits - 0.5, row * squareUnits - 0.5, squareUnits, squareUnits);
        view.fastWorldToScreenRect(this._renderRect, this._renderRect);
        if (!this._renderRect.intersect(this._clipRect)) {
          continue;
        }
        //console.log("Tile " + renderRect.toString())
        view.context.drawImage(this.buffer[col][row],
          // From source
          0,
          0,
          squareSize,
          squareSize,
          // Scaled to camera
          this._renderRect.point.x,
          this._renderRect.point.y,
          squareScreen,
          squareScreen);
      }
    }
  }
}

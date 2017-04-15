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
import * as _ from 'underscore';
import {SceneObjectRenderer} from '../../scene/scene-object-renderer';
import {Rect} from '../../../pow-core/rect';
import {TileMap} from '../tile-map';
import {TileMapView} from '../tile-map-view';
import {ITiledLayer} from '../../../pow-core/resources/tiled/tiled.model';
import {ITileInstanceMeta} from '../../../pow-core/resources/tiled/tiled';
export class TileMapRenderer extends SceneObjectRenderer {
  buffer: HTMLCanvasElement[][] = null; // A 2d grid of rendered canvas textures.
  bufferMapName: string = null; // The name of the rendered map.  If the map name changes, the buffer is re-rendered.
  bufferComplete: boolean = false; // True if the entire map was rendered with all textures loaded and ready.

  private _clipRect: Rect = new Rect();
  private _renderRect: Rect = new Rect();

  // TODO: only render tiles that are in the clipRect.  This can be expensive at initial
  // load for expansive maps like the Browser Quest tmx.
  render(object: TileMap, view: TileMapView) {
    let row: number;
    let col: number;
    let rows;
    const squareUnits = 8;
    const squareSize = squareUnits * view.unitSize;
    if (!object.isLoaded()) {
      return;
    }
    if (object.dirtyLayers) {
      object.dirtyLayers = false;
      this.buffer = null;
      this.bufferComplete = false;
    }
    if (!this.bufferComplete || this.buffer === null ||
      this.bufferMapName === null || this.bufferMapName !== object.map.url) {
      const tileUnitSize = squareSize / view.unitSize;
      // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
      const columns = Math.ceil(object.bounds.extent.x / squareUnits);
      rows = Math.ceil(object.bounds.extent.y / squareUnits);
      this.buffer = new Array(columns);
      for (col = 0; col < columns; col++) {
        this.buffer[col] = new Array(rows);
      }
      this.bufferComplete = true;
      const layers: ITiledLayer[] = object.getLayers();
      for (col = 0; col < columns; col++) {
        for (row = 0; row < rows; row++) {
          const xOffset = col * tileUnitSize;
          const xEnd = xOffset + tileUnitSize;
          const yOffset = row * tileUnitSize;
          const yEnd = yOffset + tileUnitSize;
          this.buffer[col][row] = view.renderToCanvas(squareSize, squareSize, (ctx) => {
            for (let x = xOffset; x < xEnd; x++) {
              for (let y = yOffset; y < yEnd; y++) {

                // Each layer
                _.each(layers, (l: ITiledLayer) => {
                  if (!l.visible) {
                    return;
                  }
                  const gid: number = object.getTileGid(l.name, x, y);
                  const meta: ITileInstanceMeta = object.getTileMeta(gid);
                  if (meta) {
                    const image: HTMLImageElement = (<any> meta.image).data;
                    if (!image || !image.complete) {
                      this.bufferComplete = false;
                      return;
                    }
                    const srcX: number = meta.x;
                    const srcY: number = meta.y;
                    const srcW: number = meta.width;
                    const srcH: number = meta.height;
                    const dstX: number = (x - xOffset) * view.unitSize;
                    const dstY: number = (y - yOffset) * view.unitSize;
                    const dstW: number = view.unitSize;
                    const dstH: number = view.unitSize;
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
    const squareScreen = view.fastWorldToScreenNumber(squareUnits);

    view.fastWorldToScreenRect(view.getCameraClip(), this._clipRect);
    const cols: number = this.buffer.length;
    rows = this.buffer[0].length;
    // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
    for (col = 0; col < cols; col++) {
      for (row = 0; row < rows; row++) {
        this._renderRect.set(col * squareUnits - 0.5, row * squareUnits - 0.5, squareUnits, squareUnits);
        view.fastWorldToScreenRect(this._renderRect, this._renderRect);
        if (!this._renderRect.intersect(this._clipRect)) {
          continue;
        }
        // console.log("Tile " + renderRect.toString())
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


import * as _ from 'underscore';
import { Rect } from '../../core/rect';
import { ITileInstanceMeta } from '../../core/resources/tiled/tiled';
import { ITiledLayer } from '../../core/resources/tiled/tiled.model';
import { SceneView } from '../scene-view';
import { TileMap } from '../tile-map';
export class TileMapRenderer {
  private buffer: HTMLCanvasElement[][] | null = null; // A 2d grid of rendered canvas textures.
  private bufferMapName: string | null = null; // The name of the rendered map.  If the map name changes, the buffer is re-rendered.
  private bufferComplete: boolean = false; // True if the entire map was rendered with all textures loaded and ready.
  private _clipRect: Rect = new Rect();
  private _renderRect: Rect = new Rect();

  // TODO: only render tiles that are in the clipRect.  This can be expensive at initial
  // load for expansive maps like the Browser Quest tmx.
  public render(object: TileMap, view: SceneView): void {
    let row: number;
    let col: number;
    let rows;
    const squareUnits = 8;
    const squareSize = squareUnits * view.unitSize;
    if (!object.isLoaded() || !view.context) {
      return;
    }
    if (object.dirtyLayers) {
      object.dirtyLayers = false;
      this.buffer = null;
      this.bufferComplete = false;
    }
    if (
      !this.bufferComplete ||
      this.buffer === null ||
      this.bufferMapName === null ||
      this.bufferMapName !== object.map?.url
    ) {
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
          this.buffer[col][row] = view.renderToCanvas(
            squareSize,
            squareSize,
            (ctx: CanvasRenderingContext2D) => {
              for (let x = xOffset; x < xEnd; x++) {
                for (let y = yOffset; y < yEnd; y++) {
                  // Each layer
                  _.each(layers, (l: ITiledLayer) => {
                    if (!l.visible) {
                      return;
                    }
                    const gid: number | null = object.getTileGid(l.name, x, y);
                    if (gid === null) {
                      return;
                    }
                    const meta: ITileInstanceMeta | null = object.getTileMeta(gid);
                    if (meta) {
                      // The problem is that the sprite registry goes by base filename, and chest.png is in both
                      // environment and object spritesheets.
                      // TODO: add error if sprite with same name shows up in two sheets
                      // TODO: remove chest and friends from environment

                      const image: HTMLImageElement = meta.sheet.data;
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
                      ctx.drawImage(
                        image,
                        srcX,
                        srcY,
                        srcW,
                        srcH,
                        dstX,
                        dstY,
                        dstW,
                        dstH
                      );
                    }
                  });
                }
              }
              // Append chunks to body (DEBUG HACKS)

              // var dataImage = new Image();
              // dataImage.src = ctx.canvas.toDataURL();
              // $('body').append(dataImage);
            }
          );
        }
      }
      this.bufferMapName = object.map?.url || '';
    }
    const squareScreen = view.fastWorldToScreenNumber(squareUnits);

    view.fastWorldToScreenRect(view.getCameraClip(), this._clipRect);
    const cols: number = this.buffer.length;
    rows = this.buffer[0].length;
    // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
    for (col = 0; col < cols; col++) {
      for (row = 0; row < rows; row++) {
        this._renderRect.set(
          col * squareUnits - 0.5,
          row * squareUnits - 0.5,
          squareUnits,
          squareUnits
        );
        view.fastWorldToScreenRect(this._renderRect, this._renderRect);
        if (!this._renderRect.intersect(this._clipRect)) {
          continue;
        }
        // console.log("Tile " + renderRect.toString())
        view.context.drawImage(
          this.buffer[col][row],
          // From source
          0,
          0,
          squareSize,
          squareSize,
          // Scaled to camera
          this._renderRect.point.x,
          this._renderRect.point.y,
          squareScreen,
          squareScreen
        );
      }
    }
  }
}

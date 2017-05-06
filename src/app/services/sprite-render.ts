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
import {data, ISpriteMeta} from '../../game/pow2/core/api';
import {Rect} from '../../game/pow-core/rect';
import {ImageResource} from '../../game/pow-core/resources/image.resource';
import {Injectable} from '@angular/core';
import {ResourceManager} from '../../game/pow-core/resource-manager';

@Injectable()
export class SpriteRender {
  static SIZE: number = 16;

  static getSpriteSheetUrl(name: string): string {
    return `assets/images/${name}.png`;
  }

  canvas: HTMLCanvasElement = null;
  context: CanvasRenderingContext2D = null;

  constructor(public loader: ResourceManager) {
    this.canvas = document.createElement('canvas');
    this.sizeCanvas(SpriteRender.SIZE, SpriteRender.SIZE);
  }

  sizeCanvas(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    (<any> this.context).msImageSmoothingEnabled = false;
    (<any> this.context).imageSmoothingEnabled = false;
    (<any> this.context).webkitImageSmoothingEnabled = false;
    (<any> this.context).mozImageSmoothingEnabled = false;
  }

  getSpriteSheet(name: string): Promise<ImageResource[]> {
    return this.loader.load(SpriteRender.getSpriteSheetUrl(name));
  }

  getSingleSprite(spriteName: string, frame: number = 0): Promise<HTMLImageElement> {
    let coords: any = data.sprites[spriteName];
    if (!coords) {
      return Promise.reject(`Unable to find sprite by name: ${spriteName}`);
    }
    return new Promise<HTMLImageElement>((resolve, reject) => {
      this.getSpriteSheet(coords.source).then((images: ImageResource[]) => {
        const image = images[0];
        const cell: Rect = this.getSpriteRect(spriteName, frame);

        // Resize render target to match cell size
        this.sizeCanvas(cell.extent.x, cell.extent.y);

        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render the sprite to the canvas at 0,0
        this.context.drawImage(image.data,
          // x,y
          cell.point.x, cell.point.y,
          // width,height
          cell.extent.x, cell.extent.y,
          // target x,y
          0, 0,
          // target width,height
          this.canvas.width, this.canvas.height);

        // Serialize the canvas and return as an HTMLImageElement
        const src: string = this.canvas.toDataURL();
        const result: HTMLImageElement = new Image();
        result.src = src;
        result.onload = () => {
          resolve(result);
        };
        result.onerror = (err) => {
          reject(err);
        };
      });
    });
  }

  getSpriteRect(name: string, frame: number = 0) {
    const c: ISpriteMeta = this.getSpriteMeta(name);
    let cx = c.x;
    let sourceWidth: number = SpriteRender.SIZE;
    let sourceHeight: number = SpriteRender.SIZE;
    let cy = c.y;
    if (c.frames > 1) {
      if (c && typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
        sourceWidth = c.cellWidth;
        sourceHeight = c.cellHeight;
      }
      const cwidth = c.width / sourceWidth;
      const fx = (frame % (cwidth));
      const fy = Math.floor((frame - fx) / cwidth);
      cx += fx * sourceWidth;
      cy += fy * sourceHeight;
    }
    else {
      sourceWidth = c.width;
      sourceHeight = c.height;
    }
    return new Rect(cx, cy, sourceWidth, sourceHeight);
  }

  getSpriteMeta(name: string): ISpriteMeta {
    const desc = data.sprites[name];
    return desc;
  }
}

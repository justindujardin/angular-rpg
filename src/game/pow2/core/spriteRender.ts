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

import {data, ISpriteMeta} from './api';
import {Rect} from '../../pow-core/rect';
import {IWorldObject, IWorld} from '../../pow-core/world';
import {ImageResource} from '../../pow-core/resources/image';
export class SpriteRender implements IWorldObject {
  static SIZE: number = 16;

  static getSpriteSheetUrl(name: string): string {
    return "images/" + name + ".png";
  }

  canvas: HTMLCanvasElement = null;
  context: CanvasRenderingContext2D = null;

  // IWorldObject implementation.
  world: IWorld = null;

  onAddToWorld(world: IWorld) {
  }

  onRemoveFromWorld(world: IWorld) {
  }

  constructor() {
    this.canvas = document.createElement('canvas');
    this.sizeCanvas(SpriteRender.SIZE, SpriteRender.SIZE);
  }

  sizeCanvas(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = <CanvasRenderingContext2D>this.canvas.getContext('2d');
    this.context.msImageSmoothingEnabled = false;
    (<any>this.context).imageSmoothingEnabled = false;
    (<any>this.context).webkitImageSmoothingEnabled = false;
    (<any>this.context).mozImageSmoothingEnabled = false;
  }

  getSpriteSheet(name: string): Promise<ImageResource> {
    if (this.world) {
      return this.world.loader.load(SpriteRender.getSpriteSheetUrl(name));
    }
    return Promise.reject('invalid game world');
  }

  getSingleSprite(spriteName: string, frame: number = 0): Promise<HTMLImageElement> {
    var coords: any = data.sprites[spriteName];
    if (!coords) {
      return Promise.reject("Unable to find sprite by name: " + spriteName);
    }
    return new Promise<HTMLImageElement>((resolve, reject) => {
      this.getSpriteSheet(coords.source).then((image: ImageResource)=> {
        var cell: Rect = this.getSpriteRect(spriteName, frame);

        this.sizeCanvas(cell.extent.x, cell.extent.y);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(image.data, cell.point.x, cell.point.y, cell.extent.x, cell.extent.y, 0, 0, this.canvas.width, this.canvas.height);
        var src: string = this.canvas.toDataURL();
        var result: HTMLImageElement = new Image();
        result.src = src;
        result.onload = function () {
          resolve(result);
        };
        result.onerror = function (err) {
          reject(err);
        };
      });
    });
  }

  getSpriteRect(name: string, frame: number = 0) {
    var c: ISpriteMeta = this.getSpriteMeta(name);
    var cx = c.x;
    var cy = c.y;
    if (c.frames > 1) {
      var sourceWidth: number = SpriteRender.SIZE;
      var sourceHeight: number = SpriteRender.SIZE;
      if (c && typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
        sourceWidth = c.cellWidth;
        sourceHeight = c.cellHeight;
      }
      var cwidth = c.width / sourceWidth;
      var fx = (frame % (cwidth));
      var fy = Math.floor((frame - fx) / cwidth);
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
    var desc = data.sprites[name];
    return desc;
  }
}

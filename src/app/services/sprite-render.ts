
import { Injectable } from '@angular/core';
import { Rect } from '../../app/core/rect';
import { ResourceManager } from '../../app/core/resource-manager';
import { ImageResource } from '../../app/core/resources/image.resource';
import { data, ISpriteMeta } from '../core/api';
import { assertTrue } from '../models/util';

@Injectable()
export class SpriteRender {
  static SIZE: number = 16;

  static getSpriteSheetUrl(name: string): string {
    return `assets/images/${name}.png`;
  }

  canvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;

  constructor(public loader: ResourceManager) {
    this.canvas = document.createElement('canvas');
    this.sizeCanvas(SpriteRender.SIZE, SpriteRender.SIZE);
  }

  sizeCanvas(width: number, height: number) {
    if (!this.canvas) {
      return;
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    const context = this.context as any;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
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
        if (!this.context || !this.canvas) {
          return;
        }
        const image = images[0];
        const cell: Rect = this.getSpriteRect(spriteName, frame);

        // Resize render target to match cell size
        this.sizeCanvas(cell.extent.x, cell.extent.y);

        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render the sprite to the canvas at 0,0
        this.context.drawImage(
          image.data,
          // x,y
          cell.point.x,
          cell.point.y,
          // width,height
          cell.extent.x,
          cell.extent.y,
          // target x,y
          0,
          0,
          // target width,height
          this.canvas.width,
          this.canvas.height
        );

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
    const c: ISpriteMeta | null = this.getSpriteMeta(name);
    assertTrue(c, `getSpriteRect: invalid sprite ${name}`);
    let cx = c.x;
    let sourceWidth: number = SpriteRender.SIZE;
    let sourceHeight: number = SpriteRender.SIZE;
    let cy = c.y;
    if (c.frames > 1) {
      if (
        c &&
        typeof c.cellWidth !== 'undefined' &&
        typeof c.cellHeight !== 'undefined'
      ) {
        sourceWidth = c.cellWidth;
        sourceHeight = c.cellHeight;
      }
      const cwidth = c.width / sourceWidth;
      const fx = frame % cwidth;
      const fy = Math.floor((frame - fx) / cwidth);
      cx += fx * sourceWidth;
      cy += fy * sourceHeight;
    } else {
      sourceWidth = c.width;
      sourceHeight = c.height;
    }
    return new Rect(cx, cy, sourceWidth, sourceHeight);
  }

  getSpriteMeta(name?: string): ISpriteMeta | null {
    if (!name || !data.sprites[name]) {
      return null;
    }
    const desc = data.sprites[name];
    return { ...desc, image: name };
  }
}

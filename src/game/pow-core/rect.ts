/*
 Copyright (C) 2013-2015 by Justin DuJardin

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
import {errors} from './errors';
import {Point, IPoint} from './point';
export interface IRect {
  point: Point;
  extent: Point;
}

export class Rect implements IRect {
  point: Point;
  extent: Point;

  constructor();
  constructor(rect: IRect);
  constructor(point: Point, extent: Point);
  constructor(x: number, y: number, width: number, height: number);
  constructor(rectOrPointOrX?: any, extentOrY?: any, width?: number, height?: number) {
    if (rectOrPointOrX instanceof Rect) {
      this.point = new Point(rectOrPointOrX.point);
      this.extent = new Point(rectOrPointOrX.extent);
    }
    else if (typeof width === 'number' && typeof height === 'number') {
      this.point = new Point(rectOrPointOrX, extentOrY);
      this.extent = new Point(width, height);
    }
    else if (rectOrPointOrX instanceof Point && extentOrY instanceof Point) {
      this.point = new Point(rectOrPointOrX);
      this.extent = new Point(extentOrY);
    }
    else {
      this.point = new Point(0, 0);
      this.extent = new Point(1, 1);
    }
    return this;
  }

  toString(): string {
    return `${this.point.toString()},${this.extent.toString()}`;
  }

  set(rect: IRect): Rect;
  set(point: Point, extent: Point): Rect;
  set(x: number, y: number, width: number, height: number);
  set(rectOrPointOrX: any, extentOrY?: any, width?: number, height?: number): Rect {
    if (rectOrPointOrX instanceof Rect) {
      this.point.set(rectOrPointOrX.point);
      this.extent.set(rectOrPointOrX.extent);
    }
    else if (typeof width === 'number' && typeof height === 'number') {
      this.point.set(rectOrPointOrX, extentOrY);
      this.extent.set(width, height);
    }
    else if (rectOrPointOrX instanceof Point && extentOrY instanceof Point) {
      this.point.set(rectOrPointOrX);
      this.extent.set(extentOrY);
    }
    else {
      throw new Error(errors.INVALID_ARGUMENTS);
    }
    return this;
  }

  clone(): Rect {
    return new Rect(this.point.clone(), this.extent.clone());
  }

  clip(clipRect: IRect): Rect {
    const right: number = this.point.x + this.extent.x;
    const bottom: number = this.point.y + this.extent.y;
    this.point.x = Math.max(clipRect.point.x, this.point.x);
    this.extent.x = Math.min(clipRect.point.x + clipRect.extent.x, right) - this.point.x;
    this.point.y = Math.max(clipRect.point.y, this.point.y);
    this.extent.y = Math.min(clipRect.point.y + clipRect.extent.y, bottom) - this.point.y;
    return this;
  }

  isValid(): boolean {
    return this.extent.x > 0 && this.extent.y > 0;
  }

  intersect(clipRect: IRect): boolean {
    return !(clipRect.point.x > this.point.x + this.extent.x ||
    clipRect.point.x + clipRect.extent.x < this.point.x ||
    clipRect.point.y > this.point.y + this.extent.y ||
    clipRect.point.y + clipRect.extent.y < this.point.y);
  }

  pointInRect(point: Point): boolean;
  pointInRect(x: number, y: number): boolean;
  pointInRect(pointOrX: any, y?: number) {
    let x: number = 0;
    if (pointOrX instanceof Point) {
      x = pointOrX.x;
      y = pointOrX.y;
    }
    else if (typeof pointOrX === 'number' && typeof y === 'number') {
      x = pointOrX;
    }
    else {
      throw new Error(errors.INVALID_ARGUMENTS);
    }
    if (x >= this.point.x + this.extent.x || y >= this.point.y + this.extent.y) {
      return false;
    }
    return !(x < this.point.x || y < this.point.y);
  }

  getCenter(): Point {
    const x = parseFloat((this.point.x + this.extent.x * 0.5).toFixed(2));
    const y = parseFloat((this.point.y + this.extent.y * 0.5).toFixed(2));
    return new Point(x, y);
  }

  setCenter(point: Point | IPoint): Rect;
  setCenter(x: number, y: number): Rect;
  setCenter(pointOrX: any, y?: number): Rect {
    let x: number;
    if (pointOrX instanceof Point || (pointOrX && pointOrX.x !== undefined && pointOrX.y !== undefined)) {
      x = pointOrX.x;
      y = pointOrX.y;
    }
    else {
      x = pointOrX;
    }
    this.point.x = parseFloat((x - this.extent.x * 0.5).toFixed(2));
    this.point.y = parseFloat((y - this.extent.y * 0.5).toFixed(2));
    return this;
  }

  getLeft(): number {
    return this.point.x;
  }

  getTop(): number {
    return this.point.y;
  }

  getRight(): number {
    return this.point.x + this.extent.x;
  }

  getBottom(): number {
    return this.point.y + this.extent.y;
  }

  getHalfSize(): Point {
    return new Point(this.extent.x / 2, this.extent.y / 2);
  }

  /**
   * Add a point to the rect.  This will ensure that the rect
   * contains the given point.
   * @param {Point} value The point to add.
   */
  addPoint(value: Point) {
    if (value.x < this.point.x) {
      this.extent.x = this.extent.x - (value.x - this.point.x);
      this.point.x = value.x;
    }
    if (value.y < this.point.y) {
      this.extent.y = this.extent.y - (value.x - this.point.y);
      this.point.y = value.y;
    }
    if (value.x > this.point.x + this.extent.x) {
      this.extent.x = value.x - this.point.x;
    }
    if (value.y > this.point.y + this.extent.y) {
      this.extent.y = value.y - this.point.y;
    }
  }

  inflate(x: number = 1, y: number = 1): Rect {
    this.point.x -= x;
    this.extent.x += 2 * x;
    this.point.y -= y;
    this.extent.y += 2 * y;
    return this;
  }
}

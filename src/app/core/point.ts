import { errors } from './errors';

export interface IPoint {
  x: number;
  y: number;
}

export class Point implements IPoint {
  x: number;
  y: number;

  constructor();
  constructor(point: IPoint);
  constructor(x: number, y: number);
  constructor(x: string, y: string);
  constructor(pointOrX?: any, y?: any) {
    if (pointOrX && pointOrX.hasOwnProperty('x') && pointOrX.hasOwnProperty('y')) {
      this.set(pointOrX.x, pointOrX.y);
    } else if (typeof pointOrX === 'string' && typeof y === 'string') {
      this.set(parseFloat(pointOrX), parseFloat(y));
    } else if (typeof pointOrX === 'number' && typeof y === 'number') {
      this.set(pointOrX, y);
    } else {
      this.zero();
    }
  }

  toString(): string {
    return `${this.x},${this.y}`;
  }

  set(point: Point | IPoint): Point;
  set(x: number, y: number): Point;
  set(pointOrX: any, y?: any): Point {
    // Instance of point, or set from plain object with x/y properties
    if (
      pointOrX instanceof Point ||
      (pointOrX && pointOrX.x !== undefined && pointOrX.y !== undefined)
    ) {
      this.x = pointOrX.x;
      this.y = pointOrX.y;
    } else if (typeof pointOrX === 'number' && typeof y === 'number') {
      this.x = pointOrX;
      this.y = y;
    } else {
      throw new Error(errors.INVALID_ARGUMENTS);
    }
    return this;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  floor(): Point {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  round(): Point {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  add(x: number, y: number): Point;
  add(value: number): Point;
  add(point: Point): Point;
  add(pointOrXOrValue: any, y?: number) {
    if (pointOrXOrValue instanceof Point) {
      this.x += pointOrXOrValue.x;
      this.y += pointOrXOrValue.y;
    } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
      this.x += pointOrXOrValue;
      this.y += pointOrXOrValue;
    } else {
      this.x += pointOrXOrValue;
      this.y += y as number;
    }
    return this;
  }

  subtract(x: number, y: number): Point;
  subtract(value: number): Point;
  subtract(point: Point): Point;
  subtract(pointOrXOrValue: any, y?: number) {
    if (pointOrXOrValue instanceof Point) {
      this.x -= pointOrXOrValue.x;
      this.y -= pointOrXOrValue.y;
    } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
      this.x -= pointOrXOrValue;
      this.y -= pointOrXOrValue;
    } else {
      this.x -= pointOrXOrValue;
      this.y -= y as number;
    }
    return this;
  }

  multiply(x: number, y: number): Point;
  multiply(value: number): Point;
  multiply(point: Point): Point;
  multiply(pointOrXOrValue: any, y?: number): Point {
    if (pointOrXOrValue instanceof Point) {
      this.x *= pointOrXOrValue.x;
      this.y *= pointOrXOrValue.y;
    } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
      this.x *= pointOrXOrValue;
      this.y *= pointOrXOrValue;
    } else {
      this.x *= pointOrXOrValue;
      this.y *= y as number;
    }
    return this;
  }

  divide(x: number, y: number): Point;
  divide(value: number): Point;
  divide(point: Point): Point;
  divide(pointOrXOrValue: any, y?: number): Point {
    if (pointOrXOrValue instanceof Point) {
      if (pointOrXOrValue.x === 0 || pointOrXOrValue.y === 0) {
        throw new Error(errors.DIVIDE_ZERO);
      }
      this.x /= pointOrXOrValue.x;
      this.y /= pointOrXOrValue.y;
    } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
      if (pointOrXOrValue === 0) {
        throw new Error(errors.DIVIDE_ZERO);
      }
      this.x /= pointOrXOrValue;
      this.y /= pointOrXOrValue;
    } else {
      if (pointOrXOrValue === 0 || y === 0) {
        throw new Error(errors.DIVIDE_ZERO);
      }
      this.x /= pointOrXOrValue;
      this.y /= y as number;
    }
    return this;
  }

  inverse(): Point {
    this.x *= -1;
    this.y *= -1;
    return this;
  }

  equal(point: IPoint) {
    // TODO epsilon.
    return this.x === point.x && this.y === point.y;
  }

  static equal(point: IPoint, pointTwo: IPoint) {
    // TODO epsilon.
    return pointTwo.x === point.x && pointTwo.y === point.y;
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  zero(): Point {
    this.x = this.y = 0;
    return this;
  }

  static interpolate(result: IPoint, from: IPoint, to: IPoint, factor: number): IPoint {
    factor = Math.min(Math.max(factor, 0), 1);
    result.x = from.x * (1.0 - factor) + to.x * factor;
    result.y = from.y * (1.0 - factor) + to.y * factor;
    return result;
  }

  interpolate(from: Point, to: Point, factor: number): Point {
    return Point.interpolate(this, from, to, factor) as Point;
  }
}

import {Rect} from '../../../../game/pow-core/rect';
import {Point} from '../../../../game/pow-core/point';
export interface IPicker<T> {
  // Single
  pickFirst(point: Point): T;
  pickNext(point: Point, current: T): T;

  // All
  queryPoint(point: Point, results: T[]): boolean;
  queryRect(rect: Rect, results: T[]): boolean;
}

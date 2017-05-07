import {makeRecordFactory} from './util';
import {IPoint} from '../../game/pow-core/point';
import {TypedRecord} from 'typed-immutable-record';

/**
 * Game state record.
 * @private
 * @internal
 */
interface PointRecord extends TypedRecord<PointRecord>, IPoint {
}

/**
 * Create a {@see IPoint} record with x and y number values
 */
export const pointFactory = makeRecordFactory<IPoint, PointRecord>({
  x: 0,
  y: 0
});

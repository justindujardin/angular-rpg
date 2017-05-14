import {makeRecordFactory} from './util';
import {IPoint} from '../../game/pow-core/point';
import {TypedRecord} from 'typed-immutable-record';
import {Entity} from './entity/entity.model';

/**
 * A record for points that have x/y numbers.
 */
export interface PointRecord extends TypedRecord<PointRecord>, IPoint {
}

/** Create a {@see IPoint} record with x and y number values */
export const pointFactory = makeRecordFactory<IPoint, PointRecord>({
  x: 0,
  y: 0
});

/** Immutable record for Entity objects */
export interface EntityRecord extends TypedRecord<EntityRecord>, Entity {

}
/** Create an Entity with a given partial set of properties to override defaults */
export const entityFactory = makeRecordFactory<Entity, EntityRecord>({
  eid: 'improperly-initialized-entity-' + new Date().getTime(),
  type: 'npc',
  name: 'unknown npc',
  icon: 'improperly-initialized-entity.png',
  level: 0,
  exp: 0,
  attack: 0,
  defense: 0,
  speed: 0,
  magic: 0,
  baseattack: 0,
  basespeed: 0,
  basemagic: 0,
  basedefense: 0,
  hp: 0,
  mp: 0,
  maxhp: 0,
  maxmp: 0,
  weapon: null,
  armor: null,
  helm: null,
  shield: null,
  boots: null,
  accessory: null,
});

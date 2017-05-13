import * as Immutable from 'immutable';
import {TypedRecord} from 'typed-immutable-record';
import {assertTrue} from './util';
import {ITemplateId} from './game-data/game-data.model';

/**
 * Most basic entity only has an `eid` unique identifier for indexing.
 */
export interface EntityObject {
  eid: string;
}

/**
 * Hidden attributes that are used to differentiate base level of competency for
 * a character in a given category. If a player has a high baseattack, they will
 * in general do more damage than others.
 *
 * TODO: How to balance this? I've been generally trying allocating (n) points total for hidden attributes.
 * Needs further thought and documentation.
 */
export interface IHiddenAttributes {
  /**
   * Base attack value
   */
  readonly baseattack: number;
  /**
   * Base defense value
   */
  readonly basedefense: number;
  /**
   * Base magic value
   */
  readonly basemagic: number;
  /**
   * Base speed value
   */
  readonly basespeed: number;
}

/**
 * The most basic form of an entity is the template used to create an instance. It differs
 * from a {@see BaseEntity} in that it does not have `maxmp` or `maxhp` properties. When an
 * instance is created from a template, `maxmp` and `maxhp` are assigned from the `hp` and `mp` properties.
 */
export interface TemplateEntity extends EntityObject {
  /** User readable name */
  readonly name?: string;
  /** Icon to render the entity with */
  readonly icon: string;
  /** The entity level */
  readonly level: number;
  /** Current magic points */
  readonly mp: number;
  /** Current health points */
  readonly hp: number;
  /** Attack strength */
  readonly attack: number;
  /** Defense effectiveness */
  readonly defense: number;
  /** Magic strength */
  readonly magic: number;
  /** Agility/Dexterity */
  readonly speed: number;

}

/** Basic model for a life form */
export interface BaseEntity extends TemplateEntity {
  /** Maximum magic points */
  readonly maxmp: number;
  /** Maximum health points */
  readonly maxhp: number;
}

/** Describe a collection of entities of a single type */
export interface EntityCollection<T> {
  byId: Immutable.Map<string, T>;
  allIds: Immutable.List<string>;
}

export type EntityCollectionItem = BaseEntity | ITemplateId;

/**
 * Entity collection record. DO NOT USE outside of models/ folder.
 * @private
 * @internal
 */
export interface EntityCollectionRecord extends TypedRecord<EntityCollectionRecord>, EntityCollection<BaseEntity> {
}

/**
 * @internal Add an entity to a given collection, and return a new collection. If there
 * is already an object with the given ID, the existing collection will be returned.
 */
export function addEntityToCollection(collection: EntityCollectionRecord,
                                      entity: EntityCollectionItem, entityId: string): EntityCollectionRecord {
  const index = collection.allIds.indexOf(entityId);
  assertTrue(index === -1, `item (${entityId}) already exists in collection`);
  collection = collection.updateIn(['allIds'], (allIds: Immutable.List<string>) => {
    return allIds.push(entityId);
  });
  return collection.updateIn(['byId'], (byId: Immutable.Map<string, EntityCollectionItem>) => {
    return byId.set(entityId, entity);
  });
}

/**
 * @internal Update an entity in the given collection, and return a new collection. If there
 * is no object with the given ID, throw.
 */
export function mergeEntityInCollection(collection: EntityCollectionRecord,
                                        entity: Partial<BaseEntity | ITemplateId>,
                                        entityId: string): EntityCollectionRecord {
  const index = collection.allIds.indexOf(entityId);
  assertTrue(index !== -1, `item (${entityId}) does not exist in collection`);
  return collection.updateIn(['byId'], (byId: Immutable.Map<string, BaseEntity>) => {
    return byId.set(entityId, Immutable.Map<string, any>(byId.get(entityId)).merge(entity).toJS());
  });
}

/**
 * @internal Remove an entity from a collection. IF the entity does not exist, return the
 * input collection, otherwise return a copy of the new collection.
 */
export function removeEntityFromCollection(collection: EntityCollectionRecord,
                                           entityId: string): EntityCollectionRecord {
  const index = collection.allIds.indexOf(entityId);
  assertTrue(index !== -1, `item (${entityId}) does not exist in collection`);
  collection = collection.updateIn(['allIds'], (allIds) => allIds.filter((id) => id !== entityId));
  return collection.updateIn(['byId'], (byId: Immutable.Map<string, BaseEntity>) => byId.remove(entityId));
}

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function entityCollectionFromJSON(object: EntityCollection<any>): EntityCollection<any> {
  return {
    byId: Immutable.Map<string, any>(object.byId),
    allIds: Immutable.List<string>(object.allIds)
  };
}

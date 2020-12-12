import * as Immutable from 'immutable';
import { TypedRecord } from 'typed-immutable-record';
import { CombatantTypes, IEntityObject } from './base-entity';
import { ITemplateId } from './game-data/game-data.model';
import { assertTrue } from './util';

/** Describe a collection of entities of a single type */
export interface EntityCollection<T> {
  byId: Immutable.Map<string, T>;
  allIds: Immutable.List<string>;
}

export type EntityCollectionItem = IEntityObject | ITemplateId;

/**
 * Entity collection record. DO NOT USE outside of models/ folder.
 * @private
 * @internal
 */
export interface EntityCollectionRecord
  extends TypedRecord<EntityCollectionRecord>,
    EntityCollection<IEntityObject> {}

/**
 * @internal Add an entity to a given collection, and return a new collection. If there
 * is already an object with the given ID, the existing collection will be returned.
 */
export function addEntityToCollection(
  collection: EntityCollectionRecord,
  entity: EntityCollectionItem,
  entityId: string
): EntityCollectionRecord {
  const index = collection.allIds.indexOf(entityId);
  assertTrue(index === -1, `item (${entityId}) already exists in collection`);
  collection = collection.updateIn(['allIds'], (allIds: Immutable.List<string>) => {
    return allIds.push(entityId);
  });
  return collection.updateIn(
    ['byId'],
    (byId: Immutable.Map<string, EntityCollectionItem>) => {
      return byId.set(entityId, entity);
    }
  );
}

/**
 * @internal Update an entity in the given collection, and return a new collection. If there
 * is no object with the given ID, throw.
 */
export function mergeEntityInCollection(
  collection: EntityCollectionRecord,
  entity: Partial<CombatantTypes | ITemplateId>,
  entityId: string
): EntityCollectionRecord {
  const index = collection.allIds.indexOf(entityId);
  assertTrue(index !== -1, `item (${entityId}) does not exist in collection`);
  return collection.updateIn(['byId'], (byId: Immutable.Map<string, IEntityObject>) => {
    return byId.set(
      entityId,
      Immutable.Map<string, any>(byId.get(entityId)).merge(entity).toJS()
    );
  });
}

/**
 * @internal Remove an entity from a collection. IF the entity does not exist, return the
 * input collection, otherwise return a copy of the new collection.
 */
export function removeEntityFromCollection(
  collection: EntityCollectionRecord,
  entityId: string
): EntityCollectionRecord {
  const index = collection.allIds.indexOf(entityId);
  assertTrue(index !== -1, `item (${entityId}) does not exist in collection`);
  collection = collection.updateIn(['allIds'], (allIds) =>
    allIds.filter((id) => id !== entityId)
  );
  return collection.updateIn(['byId'], (byId: Immutable.Map<string, IEntityObject>) =>
    byId.remove(entityId)
  );
}

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function entityCollectionFromJSON(
  object: EntityCollection<any>
): EntityCollection<any> {
  return {
    byId: Immutable.Map<string, any>(object.byId),
    allIds: Immutable.List<string>(object.allIds),
  };
}

import * as Immutable from 'immutable';

/**
 * Most basic entity only has an `eid` unique identifier for indexing.
 */
export interface EntityObject {
  eid: string;
}

/** Basic model for a life form */
export interface BaseEntity extends EntityObject {
  /** User readable name */
  readonly name?: string;
  /** Icon to render the entity with */
  readonly icon: string;
  /** The entity level */
  readonly level: number;
  /** Current magic points */
  readonly mp: number;
  /** Maximum magic points */
  readonly maxmp: number;
  /** Current health points */
  readonly hp: number;
  /** Maximum health points */
  readonly maxhp: number;
  /** Attack strength */
  readonly attack: number;
  /** Defense effectiveness */
  readonly defense: number;
  /** Magic strength */
  readonly magic: number;
  /** Agility/Dexterity */
  readonly speed: number;
}

/** Describe a collection of entities of a single type */
export interface EntityCollection<T> {
  byId: {
    [uniqueId: string]: T
  };
  allIds: string[];
}

/**
 * @internal Add an entity to a given collection, and return a new collection. If there
 * is already an object with the given ID, the existing collection will be returned.
 */
export function addEntityToCollection<T>(collection: EntityCollection<T>,
                                         entity: T, id: string): EntityCollection<T> {
  if (collection.allIds.indexOf(id) > -1) {
    return collection;
  }
  return Immutable.fromJS(collection).merge({
    allIds: [...collection.allIds, id],
    byId: Object.assign({}, collection.byId, {
      [id]: entity
    })
  }).toJS();
}

/**
 * @internal Remove an entity from a collection. IF the entity does not exist, return the
 * input collection, otherwise return a copy of the new collection.
 */
export function removeEntityFromCollection<T>(collection: EntityCollection<T>,
                                              entityId: string): EntityCollection<T> {
  if (!collection || !collection.byId[entityId]) {
    return collection;
  }
  const result = Immutable.fromJS(collection).toJS();
  delete result.byId[entityId];
  result.allIds = collection.allIds.filter((id: string) => id !== entityId);
  return result;
}

import * as Immutable from 'immutable';

/**
 * Most basic entity only has an `eid` unique identifier for indexing.
 */
export interface EntityObject {
  eid: string;
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
 * @internal Update an entity in the given collection, and return a new collection. If there
 * is no object with the given ID, throw.
 */
export function updateEntityInCollection<T>(collection: EntityCollection<T>,
                                            entity: T, id: string): EntityCollection<T> {
  if (collection.allIds.indexOf(id) === -1) {
    throw new Error('entity not found');
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

/**
 * Generate probably unique IDs. See: http://stackoverflow.com/questions/26501688/a-typescript-guid-class
 * @returns {string}
 */
export function newGuid() {
  /* tslint:disable */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  /* tslint:enable */
}

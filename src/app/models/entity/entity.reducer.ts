import {Entity} from './entity.model';
import {EntityActionTypes, EntityActionUnionType} from './entity.actions';
import * as Immutable from 'immutable';
import {createSelector} from 'reselect';
import {Item} from '../item';
import {EntityObject} from '../being';

/** Describe an entity collection interface */
export interface EntityCollection<T> {
  byId: {
    [uniqueId: string]: T
  };
  allIds: string[];
}

/** Collection of Entity objects */
export type EntityState = {
  beings: EntityCollection<Entity>;
  items: EntityCollection<Item>;
  // TODO: features: EntityCollection<Feature>; <-- control treasure chests, fixed encounters on maps visibility etc.
  // TODO: quests: EntityCollection<Quest>; <-- OR express everything as a quest, and just start some of them silently
};

const initialState: EntityState = {
  beings: {
    byId: {},
    allIds: []
  },
  items: {
    byId: {},
    allIds: []
  }
};

/**
 * @internal Add an entity to a given collection, and return a new collection. If there
 * is already an object with the given ID, the existing collection will be returned.
 */
function addToCollection(collection: EntityCollection<EntityObject>,
                         entity: EntityObject): EntityCollection<EntityObject> {
  if (collection.allIds.indexOf(entity.eid) > -1) {
    return collection;
  }
  return Immutable.fromJS(collection).merge({
    allIds: [...collection.allIds, entity.eid],
    byId: Object.assign({}, collection.byId, {
      [entity.eid]: entity
    })
  }).toJS();
}

/**
 * @internal Remove an entity from a collection. IF the entity does not exist, return the
 * input collection, otherwise return a copy of the new collection.
 */
function removeFromCollection(collection: EntityCollection<EntityObject>,
                              entityId: string): EntityCollection<EntityObject> {
  if (!collection || !collection.byId[entityId]) {
    return collection;
  }
  const result = Immutable.fromJS(collection).toJS();
  delete result.byId[entityId];
  result.allIds = collection.allIds.filter((id: string) => id !== entityId);
  return result;
}

export function entityReducer(state: EntityState = initialState, action: EntityActionUnionType): EntityState {
  const id: string = action.payload as string;
  const entity: EntityObject = action.payload as EntityObject;
  switch (action.type) {
    case EntityActionTypes.ADD_BEING: {
      return Immutable.fromJS(state).merge({
        beings: addToCollection(state.beings, entity)
      }).toJS();
    }
    case EntityActionTypes.REMOVE_BEING: {
      return Immutable.fromJS(state).merge({
        beings: removeFromCollection(state.beings, id)
      }).toJS();
    }

    case EntityActionTypes.ADD_ITEM: {
      return Immutable.fromJS(state).merge({
        items: addToCollection(state.items, entity)
      }).toJS();
    }
    case EntityActionTypes.REMOVE_ITEM: {
      return Immutable.fromJS(state).merge({
        items: removeFromCollection(state.items, id)
      }).toJS();
    }

    default:
      return state;
  }
}

export const sliceBeingIds = (state: EntityState) => state.beings.allIds;
export const sliceBeings = (state: EntityState) => state.beings.byId;

export const sliceItemIds = (state: EntityState) => state.items.allIds;
export const sliceItems = (state: EntityState) => state.items.byId;

import {Entity} from './entity.model';
import {Action} from '@ngrx/store';
import {EntityActionTypes, IEntityAddPayload, IEntityRemovePayload} from './entity.actions';
import * as Immutable from 'immutable';
import {createSelector} from 'reselect';

/** Describe an entity collection interface */
export interface EntityCollection<T> {
  byId: {
    [uniqueId: string]: T
  };
  allIds: string[];
}

/** Collection of Entity objects */
export type EntityState = {
  [collection: string]: EntityCollection<Entity>
};

const initialState: EntityState = {};

export function entityReducer(state: EntityState = initialState, action: Action): EntityState {
  switch (action.type) {
    case EntityActionTypes.ADD_ENTITY: {
      const payload: IEntityAddPayload = action.payload;
      const entity: Entity = Object.assign({}, payload.entity);
      let collection: EntityCollection<any> = state[payload.collection];
      if (!collection) {
        collection = {
          byId: {[entity.eid]: entity},
          allIds: [entity.eid]
        };
      }
      else if (collection.allIds.indexOf(entity.eid) > -1) {
        return state;
      }
      else {
        collection = {
          allIds: [...collection.allIds, entity.eid],
          byId: Object.assign({}, collection.byId, {
            [entity.eid]: entity
          })
        };
      }
      return Immutable.fromJS(state).merge({
        [payload.collection]: collection
      }).toJS();
    }

    case EntityActionTypes.REMOVE_ENTITY: {
      const payload: IEntityRemovePayload = action.payload;
      if (!state[payload.collection]) {
        return state;
      }

      const entityId: string = payload.entityId;
      const newState = Immutable.fromJS(state).toJS();
      const collection: EntityCollection<any> = newState[payload.collection];
      if (collection.byId[entityId]) {
        delete collection.byId[entityId];
      }
      collection.allIds = collection.allIds.filter((id: string) => id !== entityId);
      return newState;
    }

    default:
      return state;
  }
}

export const getEntities = (state: EntityState) => state.byId;

export const getIds = (state: EntityState) => state.allIds;

export const getAll = createSelector(getEntities, getIds, (entities, ids) => {
  return ids.map((id) => entities[id]);
});

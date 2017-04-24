import {Entity} from './entity.model';
import {EntityActionTypes, EntityActions} from './entity.actions';
import * as Immutable from 'immutable';
import {Map} from 'immutable';
import {Item} from '../item';
import {EntityObject, EntityCollection, removeEntityFromCollection, addEntityToCollection} from '../base-entity';
import {GameStateActionTypes, GameStateHealPartyAction, GameStateActions} from '../game-state/game-state.actions';
import {CombatActionTypes, CombatVictoryAction} from '../combat/combat.actions';
import {assertTrue} from '../util';

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

type EntityReducerTypes = EntityActions | GameStateActions;

export function entityReducer(state: EntityState = initialState, action: EntityReducerTypes): EntityState {
  const id: string = action.payload as string;
  const entity: EntityObject = action.payload as EntityObject;
  switch (action.type) {

    case EntityActionTypes.ADD_BEING: {
      return Immutable.fromJS(state).merge({
        beings: addEntityToCollection<Entity>(state.beings, entity as Entity, entity.eid)
      }).toJS();
    }
    case EntityActionTypes.REMOVE_BEING: {
      return Immutable.fromJS(state).merge({
        beings: removeEntityFromCollection<Entity>(state.beings, id)
      }).toJS();
    }

    case EntityActionTypes.ADD_ITEM: {
      return Immutable.fromJS(state).merge({
        items: addEntityToCollection<Item>(state.items, entity as Item, entity.eid)
      }).toJS();
    }
    case EntityActionTypes.REMOVE_ITEM: {
      return Immutable.fromJS(state).merge({
        items: removeEntityFromCollection<Item>(state.items, id)
      }).toJS();
    }
    case GameStateActionTypes.HEAL_PARTY: {
      const partyAction = action as GameStateHealPartyAction;
      let updateBeings: Map<string, Entity> = Immutable.fromJS(state.beings.byId);
      partyAction.payload.partyIds.forEach((partyMemberId: string) => {
        const newHp = updateBeings.getIn([partyMemberId, 'maxhp']);
        const newMp = updateBeings.getIn([partyMemberId, 'maxmp']);
        updateBeings = updateBeings.setIn([partyMemberId, 'hp'], newHp);
        updateBeings = updateBeings.setIn([partyMemberId, 'mp'], newMp);
      });
      return {
        ...state,
        beings: {
          byId: updateBeings.toJS(),
          allIds: state.beings.allIds
        }
      };
    }
    case CombatActionTypes.VICTORY: {
      const victoryAction = action as CombatVictoryAction;
      let updateBeings: Map<string, Entity> = Immutable.fromJS(state.beings.byId);
      victoryAction.payload.party.forEach((entity: Entity) => {
        assertTrue(!!(entity && entity.eid), 'invalid party entity in combat victory action');
        updateBeings = updateBeings.mergeIn([entity.eid], entity as any);
      });
      return {
        ...state,
        beings: {
          byId: updateBeings.toJS(),
          allIds: state.beings.allIds
        }
      };
    }
    default:
      return state;
  }
}

/** @internal {@see sliceEntitiesState} */
export const sliceEntityBeingIds = (state: EntityState) => state.beings.allIds;
/** @internal {@see sliceEntitiesState} */
export const sliceEntityBeings = (state: EntityState) => state.beings.byId;
/** @internal {@see sliceEntitiesState} */
export const sliceEntityItemIds = (state: EntityState) => state.items.allIds;
/** @internal {@see sliceEntitiesState} */
export const sliceEntityItems = (state: EntityState) => state.items.byId;

import {compose} from '@ngrx/core/compose';
import {ActionReducer, combineReducers} from '@ngrx/store';
import {storeFreeze} from 'ngrx-store-freeze';
import {routerReducer} from '@ngrx/router-store';
import {createSelector} from 'reselect';
import * as fromItem from './item/item.reducer';
import * as fromGameState from './game-state/game-state.reducer';
import * as fromCombat from './combat/combat.reducer';
import * as fromEntity from './entity/entity.reducer';
export const reducers = {
  router: routerReducer,
  items: fromItem.itemReducer,
  gameState: fromGameState.gameStateReducer,
  combat: fromCombat.combatReducer,
  entities: fromEntity.entityReducer
};

export type EntityCollections = 'beings' | 'items';

// Generate a reducer to set the root state in dev mode for HMR
function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    if (action.type === 'SET_ROOT_STATE') {
      return action.payload;
    }
    return reducer(state, action);
  };
}

const DEV_REDUCERS = [stateSetter, storeFreeze/*, storeLogger()*/];

const developmentReducer = compose(...DEV_REDUCERS, combineReducers)(reducers);
const productionReducer = combineReducers(reducers);

export function rootReducer(state: any, action: any) {
  if (ENV !== 'development') {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}

export const MODEL_PROVIDERS: any[] = [];

export const getEntitiesState = (state) => state.entities;
export const getEntityCollection = (name: string) => {
  return (state) => state.entities[name];
};

export const getGameState = (state) => state.gameState;

export const getGamePartyIds = createSelector(getGameState, fromGameState.slicePartyIds);

export const getGamePartyGold = createSelector(getGameState, fromGameState.sliceGold);
export const getGameShipPosition = createSelector(getGameState, fromGameState.sliceShipPosition);
export const getGameMap = createSelector(getGameState, fromGameState.sliceMap);
export const getGameCombatZone = createSelector(getGameState, fromGameState.sliceCombatZone);
export const getGameBattleCounter = createSelector(getGameState, fromGameState.sliceBattleCounter);

export const getParty = createSelector(getEntitiesState, getGamePartyIds, (entities, ids) => {
  return ids.map((id) => entities.byId[id]);
});

import {compose} from '@ngrx/core/compose';
import {ActionReducer, combineReducers} from '@ngrx/store';
import {storeFreeze} from 'ngrx-store-freeze';
import {routerReducer} from '@ngrx/router-store';
import * as fromGameState from './game-state/game-state.reducer';
import * as fromGameData from './game-data/game-data.reducer';
import * as fromCombat from './combat/combat.reducer';
import * as fromEntity from './entity/entity.reducer';
export const reducers = {
  router: routerReducer,
  gameData: fromGameData.gameDataReducer,
  gameState: fromGameState.gameStateReducer,
  combat: fromCombat.combatReducer,
  entities: fromEntity.entityReducer
};

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

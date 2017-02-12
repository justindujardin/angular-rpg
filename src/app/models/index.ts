import {compose} from '@ngrx/core/compose';
import {ActionReducer, combineReducers} from '@ngrx/store';
import {storeFreeze} from 'ngrx-store-freeze';
import {routerReducer} from '@ngrx/router-store';
import {itemReducer} from '../models/item/item.reducer';
import {gameStateReducer} from './game-state/game-state.reducer';
import {combatReducer} from './combat/combat.reducer';

export const reducers = {
  router: routerReducer,
  items: itemReducer,
  gameState: gameStateReducer,
  combat: combatReducer
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

export const MODEL_PROVIDERS: any[] = [
];

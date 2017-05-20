import {compose} from '@ngrx/core/compose';
import {ActionReducer, combineReducers} from '@ngrx/store';
import {storeFreeze} from 'ngrx-store-freeze';
import {routerReducer} from '@ngrx/router-store';
import * as fromGameState from './game-state/game-state.reducer';
import * as fromGameData from './game-data/game-data.reducer';
import {gameDataFromJSON} from './game-data/game-data.reducer';
import * as fromCombat from './combat/combat.reducer';
import {combatFromJSON} from './combat/combat.reducer';
import * as fromEntity from './entity/entity.reducer';
import * as fromSprites from './sprites/sprites.reducer';
import {spritesFromJSON} from './sprites/sprites.reducer';
import {entityFromJSON} from './entity/entity.reducer';
import {GameStateLoadSuccessAction} from './game-state/game-state.actions';
import {gameStateFromJSON} from './game-state/game-state.reducer';
import {rpgLogger} from './logger';

export const reducers = {
  router: routerReducer,
  gameData: fromGameData.gameDataReducer,
  gameState: fromGameState.gameStateReducer,
  combat: fromCombat.combatReducer,
  entities: fromEntity.entityReducer,
  sprites: fromSprites.spritesReducer
};

// Generate a reducer to set the root state in dev mode for HMR
function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    switch (action.type) {
      case 'SET_ROOT_STATE':
      case GameStateLoadSuccessAction.typeId:
        return {
          ...action.payload,
          gameState: gameStateFromJSON(action.payload.gameState),
          entities: entityFromJSON(action.payload.entities),
          gameData: gameDataFromJSON(action.payload.gameData),
          combat: combatFromJSON(action.payload.combat),
          sprites: spritesFromJSON(action.payload.sprites)
        };
      default:
        return reducer(state, action);
    }
  };
}

const DEV_REDUCERS = [stateSetter, storeFreeze, rpgLogger];
const PROD_REDUCERS = [stateSetter];

const developmentReducer = compose(...DEV_REDUCERS, combineReducers)(reducers);
const productionReducer = compose(...PROD_REDUCERS, combineReducers)(reducers);

export function rootReducer(state: any, action: any) {
  if (ENV !== 'development') {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}

export const MODEL_PROVIDERS: any[] = [];

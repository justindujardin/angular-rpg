import { routerReducer } from '@ngrx/router-store';
import { Action, ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromCombat from './combat/combat.reducer';
import { combatFromJSON } from './combat/combat.reducer';
import * as fromEntity from './entity/entity.reducer';
import { entityFromJSON } from './entity/entity.reducer';
import { GameStateLoadSuccessAction } from './game-state/game-state.actions';
import * as fromGameState from './game-state/game-state.reducer';
import { gameStateFromJSON } from './game-state/game-state.reducer';
import * as fromSprites from './sprites/sprites.reducer';
import { spritesFromJSON } from './sprites/sprites.reducer';

export interface PowAction<T = any> extends Action {
  payload: T;
}

export interface State {
  router: any;
  gameState: any;
  combat: any;
  entities: any;
  sprites: any;
}

export const reducers: ActionReducerMap<State> = {
  router: routerReducer,
  gameState: fromGameState.gameStateReducer,
  combat: fromCombat.combatReducer,
  entities: fromEntity.entityReducer,
  sprites: fromSprites.spritesReducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [stateSetter /*rpgLogger*/]
  : [stateSetter];

///
///
///

// Generate a reducer to set the root state in dev mode for HMR
function stateSetter(
  reducer: ActionReducer<any, PowAction>,
): ActionReducer<any, PowAction> {
  return (state, action) => {
    switch (action.type) {
      case 'SET_ROOT_STATE':
      case GameStateLoadSuccessAction.typeId:
        return {
          ...action.payload,
          gameState: gameStateFromJSON(action.payload.gameState),
          entities: entityFromJSON(action.payload.entities),
          combat: combatFromJSON(action.payload.combat),
          sprites: spritesFromJSON(action.payload.sprites),
        };
      default:
        return reducer(state, action);
    }
  };
}

export const MODEL_PROVIDERS: any[] = [];

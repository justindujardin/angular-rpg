import {GameStateActions, GameStateActionTypes, GameStateTravelAction} from './game-state.actions';
import {GameState} from './game-state.model';
import * as Immutable from 'immutable';
import {Observable} from 'rxjs/Rx';
import {AppState} from '../../app.model';

const initialState: GameState = {
  party: [],
  keyData: {},
  gold: 0,
  combatZone: '',
  map: '',
  position: {x: 0, y: 0},
  ts: -1
};

export function gameStateReducer(state: GameState = initialState, action: GameStateActions): GameState {
  switch (action.type) {
    case GameStateActionTypes.LOAD: {
      return Immutable.fromJS(action.payload).toJS();
    }
    case GameStateActionTypes.SAVE: {
      const gameState = action.payload;
      return Immutable.fromJS(gameState).merge({
        ts: action.payload
      }).toJS();
    }
    case GameStateActionTypes.TRAVEL: {
      const travel: GameStateTravelAction = action;
      return Immutable.fromJS(state).merge({
        map: travel.payload.map,
        position: travel.payload.position
      }).toJS();
    }
    default:
      return state;
  }
}


export function getGameState(state$: Observable<AppState>) {
  return state$.select(state => state.gameState);
}

export function getGold(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.gold);
}

export function getMap(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.map);
}

export function getPosition(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.position);
}

export function getCombatZone(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.combatZone);
}

export function getKeyData(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.keyData);
}

export function getParty(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.party);
}

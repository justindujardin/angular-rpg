import {GameStateActions, GameStateActionTypes, GameStateTravelAction, GameStateMoveAction} from './game-state.actions';
import {GameState} from './game-state.model';
import * as Immutable from 'immutable';
import {Observable} from 'rxjs/Rx';
import {AppState} from '../../app.model';
import {PartyMember} from '../party-member.model';

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
    case GameStateActionTypes.MOVE: {
      const travel: GameStateMoveAction = action;
      return Immutable.fromJS(state).merge({
        position: travel.payload
      }).toJS();
    }
    case GameStateActionTypes.ADD_GOLD: {
      const delta: number = action.payload;
      return Immutable.fromJS(state).merge({
        gold: state.gold + delta
      }).toJS();
    }
    case GameStateActionTypes.HEAL_PARTY: {
      const cost: number = action.payload;
      const party = Immutable.List(state.party).map((p: PartyMember) => {
        return Immutable.Map(p).merge({
          hp: p.maxHP
        });
      });
      return Immutable.fromJS(state).merge({
        gold: state.gold - cost,
        party: party
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

export function getAllKeyData(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.keyData);
}

export function getKeyData(state$: Observable<AppState>, key: string) {
  return state$.select(state => state.gameState.keyData[key]);
}

export function getParty(state$: Observable<AppState>) {
  return state$.select(state => state.gameState.party);
}

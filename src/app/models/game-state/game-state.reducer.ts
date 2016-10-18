import {Action} from '@ngrx/store';
import {GameStateActions} from './game-state.actions';
import {GameState} from './game-state.model';
import * as Immutable from 'immutable';

const initialState: GameState = {
  party: [],
  keyData: {},
  gold: 0,
  combatZone: '',
  map: '',
  position: {x: 0, y: 0},
  ts: -1
};

export function gameStateReducer(state: GameState = initialState, action: Action): GameState {
  switch (action.type) {
    case GameStateActions.LOAD:
      return Immutable.fromJS(action.payload).toJS();
    case GameStateActions.SAVE:
      return Immutable.fromJS(state).merge({
        ts: action.payload
      }).toJS();
    case GameStateActions.SET_MAP:
      return Immutable.fromJS(state).merge({
        map: action.payload
      }).toJS();
    case GameStateActions.SET_POSITION:
      return Immutable.fromJS(state).merge({
        position: action.payload
      }).toJS();
    default:
      return state;
  }
}

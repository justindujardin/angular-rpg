import {
  GameStateActions,
  GameStateActionTypes,
  GameStateTravelAction,
  GameStateMoveAction,
  GameStateSetKeyDataAction
} from './game-state.actions';
import {GameState} from './game-state.model';
import * as Immutable from 'immutable';
import {Item} from '../item';

const initialState: GameState = {
  party: [],
  inventory: [],
  keyData: {},
  battleCounter: 0,
  gold: 0,
  map: '',
  combatZone: '',
  position: {x: 0, y: 0},
  shipPosition: {x: 0, y: 0}
};

export function gameStateReducer(state: GameState = initialState, action: GameStateActions): GameState {
  switch (action.type) {
    case GameStateActionTypes.TRAVEL: {
      const travel = action as GameStateTravelAction;
      return Immutable.fromJS(state).merge({
        map: travel.payload.map,
        position: travel.payload.position
      }).toJS();
    }
    case GameStateActionTypes.MOVE: {
      const travel = action as GameStateMoveAction;
      return Immutable.fromJS(state).merge({
        position: travel.payload
      }).toJS();
    }
    case GameStateActionTypes.SET_KEY_DATA:
      const setKeyAction = action as GameStateSetKeyDataAction;
      const keyData = Immutable.fromJS(state.keyData);
      return Immutable.fromJS(state).merge({
        keyData: keyData.set(setKeyAction.payload.key, setKeyAction.payload.value)
      }).toJS();
    case GameStateActionTypes.ADD_GOLD: {
      const delta: number = action.payload;
      return Immutable.fromJS(state).merge({
        gold: state.gold + delta
      }).toJS();
    }
    case GameStateActionTypes.HEAL_PARTY: {
      // const cost: number = action.payload;
      // const party = Immutable.List(state.party).map((p: string) => {
      //   return Immutable.Map(p).merge({
      //     hp: p.maxhp
      //   });
      // });
      // return Immutable.fromJS(state).merge({
      //   gold: state.gold - cost,
      //   party
      // }).toJS();
      console.warn('TODO: HEAL_PARTY with only partyIds--where should this happen? Maybe an effect?');
    }
    case GameStateActionTypes.ADD_INVENTORY: {
      const item: Item = action.payload;
      return Immutable.fromJS(state).merge({
        inventory: [...state.inventory, item.eid]
      }).toJS();
    }
    case GameStateActionTypes.REMOVE_INVENTORY: {
      const item: Item = action.payload;
      return Immutable.fromJS(state).merge({
        inventory: state.inventory.filter((i: string) => i !== item.eid)
      }).toJS();
    }
    default:
      return state;
  }
}

export function sliceGold(state: GameState) {
  return state.gold;
}

export function sliceMap(state: GameState) {
  return state.map;
}

export function slicePosition(state: GameState) {
  return state.position;
}

export function sliceShipPosition(state: GameState) {
  return state.shipPosition;
}

export function sliceBattleCounter(state: GameState) {
  return state.battleCounter;
}

export function sliceCombatZone(state: GameState) {
  return state.combatZone;
}

export function slicePartyIds(state: GameState) {
  return state.party;
}

export function sliceInventoryIds(state: GameState) {
  return state.inventory;
}

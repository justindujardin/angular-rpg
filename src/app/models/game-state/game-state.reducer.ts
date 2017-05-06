import {
  GameStateActions,
  GameStateTravelAction,
  GameStateMoveAction,
  GameStateSetKeyDataAction, GameStateNewAction, GameStateAddGoldAction, GameStateHealPartyAction,
  GameStateAddInventoryAction, GameStateRemoveInventoryAction, GameStateTravelSuccessAction, GameStateTravelFailAction,
  GameStateLoadAction, GameStateLoadSuccessAction, GameStateLoadFailAction, GameStateSaveAction,
  GameStateSaveSuccessAction, GameStateSaveFailAction, GameStateNewSuccessAction, GameStateNewFailAction
} from './game-state.actions';
import {GameState} from './game-state.model';
import * as Immutable from 'immutable';
import {Item} from '../item';
import {assertTrue, exhaustiveCheck} from '../util';

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
    case GameStateNewAction.typeId: {
      return action.payload;
    }
    case GameStateNewSuccessAction.typeId:
    case GameStateNewFailAction.typeId:
      return state;
    case GameStateTravelAction.typeId: {
      return Immutable.fromJS(state).merge({
        map: action.payload.map,
        position: action.payload.position
      }).toJS();
    }
    case GameStateTravelSuccessAction.typeId:
    case GameStateTravelFailAction.typeId:
    case GameStateLoadAction.typeId:
    case GameStateLoadSuccessAction.typeId:
    case GameStateLoadFailAction.typeId:
    case GameStateSaveAction.typeId:
    case GameStateSaveSuccessAction.typeId:
    case GameStateSaveFailAction.typeId:
      return state;
    case GameStateMoveAction.typeId: {
      return Immutable.fromJS(state).merge({
        position: action.payload
      }).toJS();
    }
    case GameStateSetKeyDataAction.typeId:
      const keyData = Immutable.fromJS(state.keyData);
      return Immutable.fromJS(state).merge({
        keyData: keyData.set(action.payload.key, action.payload.value)
      }).toJS();
    case GameStateAddGoldAction.typeId: {
      return Immutable.fromJS(state).merge({
        gold: state.gold + action.payload
      }).toJS();
    }
    case GameStateHealPartyAction.typeId: {
      // Subtract cost and return.
      return Immutable.fromJS(state).merge({
        gold: state.gold - action.payload.cost
      }).toJS();
    }
    case GameStateAddInventoryAction.typeId: {
      const item: Item = action.payload;
      assertTrue(item, 'cannot add invalid item to inventory');
      assertTrue(item.eid, 'item must have an eid. consider using "entityId" or "instantiateEntity" during creation');
      assertTrue(item.id, 'item must have a template id. see game-data models for more information');
      const exists: boolean = !!state.inventory.find((i: string) => i === item.eid);
      assertTrue(!exists, 'item already exists in inventory');
      return Immutable.fromJS(state).merge({
        inventory: [...state.inventory, item.eid]
      }).toJS();
    }
    case GameStateRemoveInventoryAction.typeId: {
      const item: Item = action.payload;
      const inventory: string[] = state.inventory.filter((i: string) => i !== item.eid);
      assertTrue(inventory.length === state.inventory.length - 1, 'item does not exist in party inventory to remove');
      return Immutable.fromJS(state).merge({inventory}).toJS();
    }
    default:
      exhaustiveCheck(action);
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

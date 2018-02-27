import {
  GameStateActions,
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
  GameStateBoardShipAction,
  GameStateDeleteAction,
  GameStateDeleteFailAction,
  GameStateDeleteSuccessAction,
  GameStateEquipItemAction,
  GameStateHealPartyAction,
  GameStateLoadAction,
  GameStateLoadFailAction,
  GameStateLoadSuccessAction,
  GameStateMoveAction,
  GameStateNewAction,
  GameStateNewFailAction,
  GameStateNewSuccessAction,
  GameStateRemoveInventoryAction,
  GameStateSaveAction,
  GameStateSaveFailAction,
  GameStateSaveSuccessAction,
  GameStateSetBattleCounterAction,
  GameStateSetKeyDataAction,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction,
  GameStateUnequipItemAction
} from './game-state.actions';
import {GameState} from './game-state.model';
import * as Immutable from 'immutable';
import {Item} from '../item';
import {assertTrue, exhaustiveCheck, makeRecordFactory} from '../util';
import {TypedRecord} from 'typed-immutable-record';
import {pointFactory, PointRecord} from '../records';

/**
 * Game state record.
 * @private
 * @internal
 */
interface GameStateRecord extends TypedRecord<GameStateRecord>, GameState {
}

/**
 * Factory for creating combat state records. Useful for instantiating combat subtree
 * with a set of configured values on top of defaults. Helpful for deserialization and
 * testing.
 * @internal
 */
export const gameStateFactory = makeRecordFactory<GameState, GameStateRecord>({
  party: Immutable.List<string>(),
  inventory: Immutable.List<string>(),
  keyData: Immutable.Map<string, any>(),
  battleCounter: 64,
  gold: 0,
  location: '',
  combatZone: '',
  position: pointFactory(),
  shipPosition: pointFactory(),
  boardedShip: false
});

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function gameStateFromJSON(object: GameState): GameState {
  const recordValues = {
    ...object,
    party: Immutable.List<string>(object.party),
    inventory: Immutable.List<string>(object.inventory),
    keyData: Immutable.Map<string, any>(object.keyData),
    position: pointFactory(object.position),
    shipPosition: pointFactory(object.shipPosition)
  };
  return gameStateFactory(recordValues);
}

export function gameStateReducer(state: GameStateRecord = gameStateFactory(), action: GameStateActions): GameState {
  switch (action.type) {
    case GameStateNewAction.typeId: {
      return gameStateFromJSON(action.payload);
    }
    case GameStateNewSuccessAction.typeId:
    case GameStateNewFailAction.typeId:
      return state;
    case GameStateTravelAction.typeId: {
      return state.merge({
        position: pointFactory(action.payload.position),
        location: action.payload.location
      });
    }
    case GameStateEquipItemAction.typeId:
      assertTrue(state.party.find((i) => i === action.payload.entityId),
        'cannot equip item on entity that is not in the party');
      assertTrue(state.inventory.find((i) => i === action.payload.itemId), 'item does not exist in inventory');
      return state.merge({
        inventory: state.inventory.filter((i: string) => i !== action.payload.itemId)
      });
    case GameStateUnequipItemAction.typeId:
      assertTrue(state.party.find((i) => i === action.payload.entityId),
        'cannot remove item from entity that is not in the party');
      assertTrue(!state.inventory.find((i) => i === action.payload.itemId), 'item already exists in inventory');
      return state.merge({
        inventory: state.inventory.push(action.payload.itemId)
      });
    case GameStateTravelSuccessAction.typeId:
    case GameStateTravelFailAction.typeId:
    case GameStateLoadAction.typeId:
    case GameStateLoadSuccessAction.typeId:
    case GameStateLoadFailAction.typeId:
    case GameStateDeleteAction.typeId:
    case GameStateDeleteSuccessAction.typeId:
    case GameStateDeleteFailAction.typeId:
    case GameStateSaveAction.typeId:
    case GameStateSaveSuccessAction.typeId:
    case GameStateSaveFailAction.typeId:
      return state;
    case GameStateMoveAction.typeId: {
      if (state.boardedShip) {
        return state.merge({
          position: action.payload,
          shipPosition: action.payload,
        });
      }
      else {
        return state.merge({
          position: action.payload
        });
      }
    }
    case GameStateBoardShipAction.typeId: {
      return state.merge({
        boardedShip: action.payload
      });
    }
    case GameStateSetBattleCounterAction.typeId: {
      return state.merge({
        battleCounter: action.payload
      });
    }
    case GameStateSetKeyDataAction.typeId:
      return state.merge({
        keyData: state.keyData.set(action.payload.key, action.payload.value)
      });
    case GameStateAddGoldAction.typeId: {
      return state.merge({
        gold: state.gold + action.payload
      });
    }
    case GameStateHealPartyAction.typeId: {
      // Subtract cost and return.
      return state.merge({
        gold: state.gold - action.payload.cost
      });
    }
    case GameStateAddInventoryAction.typeId: {
      const item: Item = action.payload;
      assertTrue(item, 'cannot add invalid item to inventory');
      assertTrue(item.eid, 'item must have an eid. consider using "entityId" or "instantiateEntity" during creation');
      assertTrue(item.id, 'item must have a template id. see game-data models for more information');
      const exists: boolean = !!state.inventory.find((i: string) => i === item.eid);
      assertTrue(!exists, 'item already exists in inventory');
      return state.merge({
        inventory: state.inventory.push(item.eid)
      });
    }
    case GameStateRemoveInventoryAction.typeId: {
      const item: Item = action.payload;
      const inventory = state.inventory.filter((i: string) => i !== item.eid);
      assertTrue(inventory.count() === state.inventory.count() - 1, 'item does not exist in party inventory to remove');
      return state.merge({
        inventory
      });
    }
    default:
      exhaustiveCheck(action);
      return state;
  }
}
/** @internal {@see sliceGameState} */
export const sliceGameStateKeyData = (state: GameState) => state.keyData;

export function sliceGold(state: GameState) {
  return state.gold;
}

export function sliceMap(state: GameState) {
  return state.location;
}

export function slicePosition(state: GameState) {
  return state.position;
}

export function sliceShipPosition(state: GameState) {
  return state.shipPosition;
}

export function sliceBoardedShip(state: GameState) {
  return state.boardedShip;
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

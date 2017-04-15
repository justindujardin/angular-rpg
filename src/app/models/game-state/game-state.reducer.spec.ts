import {gameStateReducer} from './game-state.reducer';
import {GameState} from './game-state.model';
import {
  GameStateLoadAction,
  GameStateHealPartyAction,
  GameStateTravelAction,
  GameStateMoveAction,
  GameStateAddGoldAction,
  GameStateSetKeyDataAction,
  GameStateAddInventoryAction, GameStateRemoveInventoryAction, GameStateNewAction
} from './game-state.actions';
import {Item} from '../item';
const itemId: string = 'test-item-fake';

function fakeItem(uniqueId: string = itemId): Item {
  const testItem: Partial<Item> = {
    id: 'test-item-' + uniqueId
  };
  return Object.assign({}, testItem as Item);
}
function defaultState(overrides?: any): GameState {
  const baseState: GameState = {
    party: [],
    inventory: [],
    keyData: {},
    battleCounter: 0,
    gold: 0,
    map: '',
    combatZone: '',
    shipPosition: {x: 0, y: 0},
    position: {x: 0, y: 0},
    ts: -1
  };
  return Object.assign({}, baseState, overrides || {});
}

describe('GameState', () => {
  describe('Actions', () => {
    xdescribe('GameStateNewAction', () => {
      it('should overwrite entire gameState with payload', () => {
        const state = defaultState();
        const expected = defaultState({
          party: [1, 2, 3],
          gold: 1337
        });
        const actual = gameStateReducer(state, new GameStateNewAction(expected));
        expect(actual).toEqual(expected);
      });
    });

    describe('GameStateHealPartyAction', () => {
      it('should deduct healing cost from game state gold', () => {
        const state = defaultState({
          gold: 100
        });
        const actual = gameStateReducer(state, new GameStateHealPartyAction({
          cost: 50,
          partyIds: []
        }));
        expect(actual.gold).toEqual(50);
      });
    });

    describe('GameStateSetKeyDataAction', () => {
      it('should set a new key/value pair if none exist', () => {
        const state = defaultState();
        const newKey = 'testKey';
        const newValue = true;
        expect(state.keyData[newKey]).toBeUndefined();
        const newState = gameStateReducer(state, new GameStateSetKeyDataAction(newKey, newValue));
        expect(newState.keyData[newKey]).toBe(newValue);
      });
      it('should update an existing keys value if it already exists', () => {
        const state = defaultState({
          keyData: {
            testKey: true
          }
        });
        const keyName = 'testKey';
        expect(state.keyData[keyName]).toBe(true);
        const newState = gameStateReducer(state, new GameStateSetKeyDataAction(keyName, false));
        expect(newState.keyData[keyName]).toBe(false);
      });
    });

    describe('GameStateTravelAction', () => {
      it('should update the current world map', () => {
        const state = defaultState({
          map: 'firstMap'
        });
        const newMap = 'newMap';
        const actual = gameStateReducer(state, new GameStateTravelAction(newMap, state.position));
        expect(actual.map).toBe(newMap);
      });
      it('should update the player position', () => {
        const state = defaultState({
          position: {x: 0, y: 0}
        });
        const expected = {x: 10, y: 10};
        const actual = gameStateReducer(state, new GameStateTravelAction('', expected));
        expect(actual.position).toEqual(expected);
      });
    });

    describe('GameStateAddGoldAction', () => {
      it('should add gold when given a positive number', () => {
        const state = defaultState({gold: 100});
        const actual = gameStateReducer(state, new GameStateAddGoldAction(10));
        expect(actual.gold).toBe(110);
      });
      it('should subtract gold when given a negative number', () => {
        const state = defaultState({gold: 100});
        const actual = gameStateReducer(state, new GameStateAddGoldAction(-10));
        expect(actual.gold).toBe(90);
      });
    });
    describe('GameStateMoveAction', () => {
      it('should update the player position', () => {
        const state = defaultState({
          position: {x: 0, y: 0}
        });
        const expected = {x: 10, y: 10};
        const actual = gameStateReducer(state, new GameStateMoveAction(expected));
        expect(actual.position).toEqual(expected);
      });
    });
    describe('GameStateAddInventoryAction', () => {
      it('should store the id of the given item in the inventory array', () => {
        const state = defaultState();
        const item = fakeItem();
        const actual = gameStateReducer(state, new GameStateAddInventoryAction(item));
        expect(actual.inventory.indexOf(item.eid)).toBeGreaterThan(-1);
      });
    });
    describe('GameStateRemoveInventoryAction', () => {
      it('should remove the given item by id from the inventory array', () => {
        const item = fakeItem();
        const state = defaultState({
          inventory: [item.eid]
        });
        const actual = gameStateReducer(state, new GameStateRemoveInventoryAction(item));
        expect(actual.inventory.length).toBe(0);
      });
    });

  });
});

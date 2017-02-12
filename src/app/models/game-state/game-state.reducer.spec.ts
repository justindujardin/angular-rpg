import {gameStateReducer} from './game-state.reducer';
import {GameState} from './game-state.model';
import {
  GameStateLoadAction,
  GameStateHealPartyAction,
  GameStateTravelAction,
  GameStateMoveAction,
  GameStateAddGoldAction,
  GameStateSetKeyDataAction
} from './game-state.actions';

function defaultState(overrides?: any): GameState {
  return Object.assign({}, {
    party: [],
    keyData: {},
    gold: 0,
    map: '',
    position: {x: 0, y: 0},
    ts: -1
  }, overrides || {});
}

describe('GameState', () => {
  describe('Actions', () => {
    describe('GameStateLoadAction', () => {
      it('should overwrite entire gameState with payload', () => {
        const state = defaultState();
        const expected = defaultState({
          party: [1, 2, 3],
          gold: 1337
        });
        const actual = gameStateReducer(state, new GameStateLoadAction(expected));
        expect(actual).toEqual(expected);
      });
    });

    describe('GameStateHealPartyAction', () => {
      it('should restore all party members hp to maxhp', () => {
        const state = defaultState({
          party: [
            {hp: 0, maxhp: 25},
            {hp: 25, maxhp: 22}
          ]
        });
        const expected = defaultState({
          party: [
            {hp: 25, maxhp: 25},
            {hp: 22, maxhp: 22}
          ]
        });
        const actual = gameStateReducer(state, new GameStateHealPartyAction(0));
        expect(actual).toEqual(expected);
      });

      it('should deduct healing cost from game state gold', () => {
        const state = defaultState({
          gold: 100
        });
        const actual = gameStateReducer(state, new GameStateHealPartyAction(50));
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
  });
});

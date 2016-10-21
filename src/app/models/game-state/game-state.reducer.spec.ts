import {gameStateReducer} from './game-state.reducer';
import {GameState} from './game-state.model';
import {
  GameStateLoadAction,
  GameStateHealPartyAction,
  GameStateTravelAction,
  GameStateMoveAction,
  GameStateAddGoldAction
} from './game-state.actions';

function defaultState(overrides?: any): GameState {
  return Object.assign({}, {
    party: [],
    keyData: {},
    gold: 0,
    combatZone: '',
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
      it('should restore all party members hp to maxHP', () => {
        const state = defaultState({
          party: [
            {hp: 0, maxHP: 25},
            {hp: 25, maxHP: 22}
          ]
        });
        const expected = defaultState({
          party: [
            {hp: 25, maxHP: 25},
            {hp: 22, maxHP: 22}
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

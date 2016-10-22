import {CombatState, CombatFixedEncounter} from './combat.model';
import {combatReducer} from './combat.reducer';
import {CombatFixedEncounterAction} from './combat.actions';

function defaultState(overrides?: any): CombatState {
  return Object.assign({}, {
    loading: false,
    current: -1,
    encounters: []
  }, overrides || {});
}

function fixedEncounter(overrides?: any): CombatFixedEncounter {
  return Object.assign({}, {
    id: 'fake-encounter',
    enemies: [],
    party: [],
    gold: 1,
    experience: 1,
    items: []
  }, overrides || {});
}

function randomEncounter(overrides?: any): CombatFixedEncounter {
  return Object.assign({}, {
    id: 'fake-encounter',
    enemies: [],
    party: [],
    zones: []
  }, overrides || {});
}

describe('Combat', () => {
  describe('Actions', () => {
    describe('CombatFixedEncounterAction', () => {
      it('should add to encounters array and tag the encounter with type "fixed"', () => {
        const state = fixedEncounter();
        const expected = fixedEncounter({type:'fixed'});
        const actual = combatReducer(defaultState(), new CombatFixedEncounterAction(state));
        expect(actual.encounters[0]).toEqual(expected);
      });
      it('should set loading to true', () => {
        const state = defaultState();
        expect(state.loading).toBe(false);
        const actual = combatReducer(state, new CombatFixedEncounterAction(fixedEncounter()));
        expect(actual.loading).toBe(true);
      });
    });
  });
});

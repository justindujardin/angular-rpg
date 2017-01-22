import {CombatState, CombatFixedEncounter} from './combat.model';
import {combatReducer} from './combat.reducer';
import {CombatFixedEncounterAction} from './combat.actions';

function defaultState(overrides?: any): CombatState {
  const base: CombatState = {
    loading: false,
    encounter: null
  };
  return Object.assign({}, base, overrides || {});
}

function fixedEncounter(overrides?: any): CombatFixedEncounter {
  const base: CombatFixedEncounter = {
    id: 'fake-encounter',
    enemies: [],
    party: [],
    gold: 1,
    experience: 1,
    items: []
  };
  return Object.assign({}, base, overrides || {});
}

function randomEncounter(overrides?: any): CombatFixedEncounter {
  const base: CombatFixedEncounter = {
    id: 'fake-encounter',
    enemies: [],
    party: []
  };
  return Object.assign({}, base, overrides || {});
}

describe('Combat', () => {
  describe('Actions', () => {
    describe('CombatFixedEncounterAction', () => {
      it('should set current encounter and tag the encounter with type "fixed"', () => {
        const state = fixedEncounter();
        const expected = fixedEncounter({type: 'fixed'});
        const actual = combatReducer(defaultState(), new CombatFixedEncounterAction(state));
        expect(actual.encounter).toEqual(expected);
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

import {Combatant, CombatAttack, CombatEncounter} from './combat.model';
import {combatReducer, combatStateFactory} from './combat.reducer';
import {CombatAttackAction, CombatEncounterAction} from './combat.actions';
import {entityId} from '../game-data/game-data.model';
import * as Immutable from 'immutable';

function attack(from: Combatant, to: Combatant, value: number): CombatAttack {
  const result: CombatAttack = {
    attacker: from,
    defender: to,
    damage: value
  };
  return Object.assign({}, result);
}

function encounter(values?: Partial<CombatEncounter>): CombatEncounter {
  return Object.assign({}, {
    type: 'fixed',
    party: [],
    enemies: []
  }, values || {});
}

function combatant(values?: Partial<Combatant>): Combatant {
  return Object.assign({
    eid: entityId('test-entity'),
    mp: 0,
    maxmp: 0,
    hp: 0,
    maxhp: 0
  }, values || {}) as Combatant;
}

fdescribe('Combat', () => {
  describe('Actions', () => {
    describe('CombatEncounterAction', () => {
      it('should set loading to true', () => {
        const state = combatStateFactory();
        expect(state.loading).toBe(false);
        const actual = combatReducer(state, new CombatEncounterAction(encounter()));
        expect(actual.loading).toBe(true);
      });
    });
    describe('CombatAttackAction', () => {
      it('should throw when dispatched with no active encounter', () => {
        expect(() => {
          combatReducer(combatStateFactory(), new CombatAttackAction(attack(combatant(), combatant(), 0)));
        }).toThrow();
      });
      it('should deduct damage value from target hp', () => {
        const attacker = combatant();
        const defender = combatant({hp: 5});
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List([attacker]),
          party: Immutable.List([defender])
        });
        const actual = combatReducer(state, new CombatAttackAction(attack(attacker, defender, 3)));
        expect(actual.party.get(0).hp).toBe(2);
      });
      it('should add hp when given a negative damage value from target hp', () => {
        const attacker = combatant();
        const defender = combatant({hp: 1});
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List([attacker]),
          party: Immutable.List([defender])
        });
        const actual = combatReducer(state, new CombatAttackAction(attack(attacker, defender, -4)));
        expect(actual.party.get(0).hp).toBe(5);
      });
      it('should attack combatants in enemies list', () => {
        const attacker = combatant();
        const defender = combatant({hp: 5});
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List([defender]),
          party: Immutable.List([attacker])
        });
        const actual = combatReducer(state, new CombatAttackAction(attack(attacker, defender, 3)));
        expect(actual.enemies.get(0).hp).toBe(2);
      });
      it('should never set hp to values less than 0', () => {
        const attacker = combatant();
        const defender = combatant({hp: 5});
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List([defender]),
          party: Immutable.List([attacker])
        });
        const actual = combatReducer(state, new CombatAttackAction(attack(attacker, defender, 10)));
        expect(actual.enemies.get(0).hp).toBe(0);
      });
    });
  });
});

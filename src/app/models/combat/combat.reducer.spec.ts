import * as Immutable from 'immutable';
import { CombatantTypes, IEnemy, IPartyMember } from '../base-entity';
import { entityId } from '../game-data/game-data.model';
import {
  CombatAttackAction,
  CombatEncounterAction,
  CombatVictoryCompleteAction,
  CombatVictorySummary,
} from './combat.actions';
import { CombatAttack, CombatEncounter } from './combat.model';
import { combatReducer, combatStateFactory } from './combat.reducer';

function attack(from: CombatantTypes, to: CombatantTypes, value: number): CombatAttack {
  const result: CombatAttack = {
    attacker: from,
    defender: to,
    damage: value,
  };
  return Object.assign({}, result);
}

function encounter(values?: Partial<CombatEncounter>): CombatEncounter {
  return {
    type: 'fixed',
    party: Immutable.List<any>([]),
    enemies: Immutable.List<any>([]),
    zone: null,
    ...(values || {}),
  };
}

function combatant(values?: Partial<CombatantTypes>): CombatantTypes {
  return Object.assign(
    {
      eid: entityId('test-entity'),
      mp: 0,
      maxmp: 0,
      hp: 0,
      maxhp: 0,
    },
    values || {}
  ) as any;
}

describe('Combat', () => {
  describe('Actions', () => {
    describe('CombatEncounterAction', () => {
      it('should set loading to true', () => {
        const state = combatStateFactory();
        expect(state.loading).toBe(false);
        const actual = combatReducer(state, new CombatEncounterAction(encounter()));
        expect(actual.loading).toBe(true);
      });
    });
    describe('CombatVictoryCompleteAction', () => {
      it('should reset combat state', () => {
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List<IEnemy>([combatant()]),
          party: Immutable.List<IPartyMember>([combatant()]),
        });
        const victorySummary: CombatVictorySummary = {
          type: 'fixed',
          id: 'fake-id',
          party: [],
          enemies: [],
          levels: [],
          items: [],
          gold: 0,
          exp: 0,
        };
        expect(state.enemies.count()).toBe(1);
        expect(state.party.count()).toBe(1);
        const actual = combatReducer(
          state,
          new CombatVictoryCompleteAction(victorySummary)
        );
        expect(actual.enemies.count()).toBe(0);
        expect(actual.party.count()).toBe(0);
      });
    });
    describe('CombatAttackAction', () => {
      it('should throw when dispatched with no active encounter', () => {
        expect(() => {
          combatReducer(
            combatStateFactory(),
            new CombatAttackAction(attack(combatant(), combatant(), 0))
          );
        }).toThrow();
      });
      it('should deduct damage value from target hp', () => {
        const attacker = combatant();
        const defender = combatant({ hp: 5 });
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List<IEnemy>([attacker]),
          party: Immutable.List<IPartyMember>([defender]),
        });
        const actual = combatReducer(
          state,
          new CombatAttackAction(attack(attacker, defender, 3))
        );
        expect(actual.party.get(0).hp).toBe(2);
      });
      it('should not set target hp to less than 0', () => {
        const attacker = combatant();
        const defender = combatant({ hp: 5, maxhp: 5 });
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List<IEnemy>([attacker]),
          party: Immutable.List<IPartyMember>([defender]),
        });
        const actual = combatReducer(
          state,
          new CombatAttackAction(attack(attacker, defender, 13))
        );
        expect(actual.party.get(0).hp).toBe(0);
      });
      it('should not set target hp to greater than maxhp', () => {
        const attacker = combatant();
        const defender = combatant({ hp: 5, maxhp: 5 });
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List<IEnemy>([attacker]),
          party: Immutable.List<IPartyMember>([defender]),
        });
        const actual = combatReducer(
          state,
          new CombatAttackAction(attack(attacker, defender, -10))
        );
        expect(actual.party.get(0).hp).toBe(5);
      });
      it('should add hp when given a negative damage value from target hp', () => {
        const attacker = combatant();
        const defender = combatant({ hp: 1 });
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List<IEnemy>([attacker]),
          party: Immutable.List<IPartyMember>([defender]),
        });
        const actual = combatReducer(
          state,
          new CombatAttackAction(attack(attacker, defender, -4))
        );
        expect(actual.party.get(0).hp).toBe(5);
      });
      it('should attack combatants in enemies list', () => {
        const attacker = combatant();
        const defender = combatant({ hp: 5, maxhp: 5 });
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List<IEnemy>([defender]),
          party: Immutable.List<IPartyMember>([attacker]),
        });
        const actual = combatReducer(
          state,
          new CombatAttackAction(attack(attacker, defender, 3))
        );
        expect(actual.enemies.get(0).hp).toBe(2);
      });
      it('should throw if given an entity that is in neither enemies nor party lists', () => {
        const attacker = combatant();
        const defender = combatant({ hp: 5, maxhp: 5 });
        const state = combatStateFactory();
        expect(() => {
          combatReducer(state, new CombatAttackAction(attack(attacker, defender, 3)));
        }).toThrow();
      });
      it('should never set hp to values less than 0', () => {
        const attacker = combatant();
        const defender = combatant({ hp: 5, maxhp: 5 });
        const state = combatStateFactory({
          type: 'fixed',
          loading: false,
          enemies: Immutable.List<IEnemy>([defender]),
          party: Immutable.List<IPartyMember>([attacker]),
        });
        const actual = combatReducer(
          state,
          new CombatAttackAction(attack(attacker, defender, 10))
        );
        expect(actual.enemies.get(0).hp).toBe(0);
      });
    });
  });
});

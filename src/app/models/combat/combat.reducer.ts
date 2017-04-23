import {CombatActions, CombatActionTypes} from './combat.actions';
import {Combatant, CombatAttack, combatStateFactory, CombatStateRecord} from './combat.model';
import {List} from 'immutable';
import {assertTrue} from '../util';

export function combatReducer(state: CombatStateRecord = combatStateFactory(), action: CombatActions): CombatStateRecord {
  switch (action.type) {
    case CombatActionTypes.ENCOUNTER: {
      return state.merge({
        loading: true,
        ...action.payload
      });
    }
    case CombatActionTypes.ENCOUNTER_READY: {
      return state.set('loading', false);
    }
    case CombatActionTypes.ACTION_ATTACK: {
      const data = action.payload as CombatAttack;
      const matchDefender = (c: Combatant) => c.eid === data.defender.eid;
      assertTrue(state.type !== 'none', 'invalid encounter for attack action');

      // Attacking enemy
      let index = state.enemies.findIndex(matchDefender);
      if (index !== -1) {
        const target: Combatant = data.defender;
        return state.update('enemies', (items: List<Combatant>) => {
          const current = items.get(index);
          assertTrue(current, 'invalid target for attack action');
          const newHp: number = Math.max(current.hp - data.damage, 0);
          return items.set(index, {
            ...current,
            hp: newHp
          })
        });
      }

      index = state.party.findIndex(matchDefender);
      // Attacking party
      if (index !== -1) {
        const target: Combatant = data.defender;
        return state.update('party', (items: List<Combatant>) => {
          const current = items.get(index);
          assertTrue(current, 'invalid target for attack action');
          const newHp: number = Math.max(current.hp - data.damage, 0);
          return items.set(index, {
            ...current,
            hp: newHp
          })
        });
      }
      assertTrue(index !== -1, 'attack target found in neither enemies nor party lists');
      return state;
    }
    default:
      return state;
  }
}

/** @internal {@see sliceCombatState} */
export const sliceCombatLoading = (state: CombatStateRecord) => state.loading;
/** @internal {@see sliceCombatState} */
export const sliceCombatEncounterEnemies = (state: CombatStateRecord) => state.enemies;
/** @internal {@see sliceCombatState} */
export const sliceCombatEncounterParty = (state: CombatStateRecord) => state.party;

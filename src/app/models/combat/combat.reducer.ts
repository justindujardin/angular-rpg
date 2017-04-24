import {CombatActions, CombatActionTypes} from './combat.actions';
import {Combatant, CombatAttack, CombatState} from './combat.model';
import {List} from 'immutable';
import {assertTrue} from '../util';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import * as Immutable from 'immutable';
import {Entity} from '../entity/entity.model';

/**
 * Combat state record.
 * @private
 * @internal
 */
interface CombatStateRecord extends TypedRecord<CombatStateRecord>, CombatState {
}

/**
 * Factory for creating combat state records. Useful for instantiating combat subtree
 * with a set of configured values on top of defaults. Helpful for deserialization and
 * testing.
 * @internal
 */
export const combatStateFactory = makeTypedFactory<CombatState, CombatStateRecord>({
  loading: false,
  enemies: Immutable.List<Combatant>(),
  party: Immutable.List<Entity>(),
  type: 'none',
  message: [],
  gold: 0,
  experience: 0,
  items: [],
  zone: '',
  id: '',
});

export function combatReducer(state: CombatStateRecord = combatStateFactory(),
                              action: CombatActions): CombatStateRecord {
  switch (action.type) {
    case CombatActionTypes.ENCOUNTER: {
      return state.merge({
        loading: true,
        ...action.payload
      });
    }
    case CombatActionTypes.ENCOUNTER_READY: {
      return state.merge({loading: true});
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
          });
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
          });
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

import {
  CombatActions, CombatAttackAction, CombatEncounterAction, CombatEncounterReadyAction,
  CombatVictoryAction, CombatVictoryCompleteAction
} from './combat.actions';
import {Combatant, CombatAttack, CombatState} from './combat.model';
import * as Immutable from 'immutable';
import {List} from 'immutable';
import {assertTrue, exhaustiveCheck, makeRecordFactory} from '../util';
import {TypedRecord} from 'typed-immutable-record';
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
export const combatStateFactory = makeRecordFactory<CombatState, CombatStateRecord>({
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

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function combatFromJSON(object: CombatState): CombatState {
  const recordValues = {
    ...object,
    enemies: Immutable.List<Combatant>(object.enemies),
    party: Immutable.List<Entity>(object.party),
  };
  return combatStateFactory(recordValues);
}

export function combatReducer(state: CombatStateRecord = combatStateFactory(),
                              action: CombatActions): CombatStateRecord {
  switch (action.type) {
    case CombatEncounterAction.typeId: {
      return state.merge({
        loading: true,
        ...action.payload
      });
    }
    case CombatEncounterReadyAction.typeId: {
      return state.merge({loading: true});
    }
    case CombatVictoryAction.typeId: {
      return state;
    }
    case CombatVictoryCompleteAction.typeId: {
      // We're done here, reset state
      return combatStateFactory();
    }
    case CombatAttackAction.typeId: {
      const data: CombatAttack = action.payload;
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
      exhaustiveCheck(action);
      return state;
  }
}

/** @internal {@see sliceCombatState} */
export const sliceCombatLoading = (state: CombatStateRecord) => state.loading;
/** @internal {@see sliceCombatState} */
export const sliceCombatEncounterEnemies = (state: CombatStateRecord) => state.enemies;
/** @internal {@see sliceCombatState} */
export const sliceCombatEncounterParty = (state: CombatStateRecord) => state.party;

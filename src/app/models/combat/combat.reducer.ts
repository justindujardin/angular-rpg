import * as Immutable from 'immutable';
import { List } from 'immutable';
import { TypedRecord } from 'typed-immutable-record';
import { CombatantTypes, EntityStatuses, IEnemy, IPartyMember } from '../base-entity';
import { assertTrue, exhaustiveCheck, makeRecordFactory } from '../util';
import {
  CombatActions,
  CombatAttackAction,
  CombatClearStatusAction,
  CombatEncounterAction,
  CombatEncounterReadyAction,
  CombatEscapeAction,
  CombatEscapeCompleteAction,
  CombatSetStatusAction,
  CombatVictoryAction,
  CombatVictoryCompleteAction,
  ICombatStatusPayload,
} from './combat.actions';
import { CombatAttack, CombatState } from './combat.model';

/**
 * Combat state record.
 * @internal
 */
export interface CombatStateRecord extends TypedRecord<CombatStateRecord>, CombatState {
  // pass
}

/**
 * Factory for creating combat state records. Useful for instantiating combat subtree
 * with a set of configured values on top of defaults. Helpful for deserialization and
 * testing.
 * @internal
 */
export const combatStateFactory = makeRecordFactory<CombatState, CombatStateRecord>({
  loading: false,
  enemies: Immutable.List<IEnemy>(),
  party: Immutable.List<IPartyMember>(),
  type: 'none',
  message: Immutable.List<string>(),
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
    enemies: Immutable.List<IEnemy>(object.enemies),
    party: Immutable.List<IPartyMember>(object.party),
  };
  return combatStateFactory(recordValues);
}

export function combatReducer(
  state: CombatStateRecord = combatStateFactory(),
  action: CombatActions
): CombatStateRecord {
  switch (action.type) {
    case CombatEncounterAction.typeId: {
      return state.merge({
        loading: true,
        ...action.payload,
      });
    }
    case CombatClearStatusAction.typeId:
    case CombatSetStatusAction.typeId: {
      const isSet: boolean = action.type === CombatSetStatusAction.typeId;
      let stateGroup: string = 'enemies';
      let groupIndex: number = -1;
      const data: ICombatStatusPayload = action.payload;
      const matchDefender = (c?: CombatantTypes) => c?.eid === data.target.eid;

      groupIndex = state.enemies.findIndex(matchDefender);
      if (groupIndex === -1) {
        stateGroup = 'party';
        groupIndex = state.party.findIndex(matchDefender);
      }
      if (groupIndex === -1) {
        return state;
      }
      return state.update(stateGroup, (items: List<CombatantTypes>) => {
        const current = items.get(groupIndex);
        if (!current) {
          return items;
        }
        let statuses = Immutable.Set<string>(current?.status?.slice());
        if (isSet) {
          statuses = statuses.concat(data.classes).toSet();
        } else {
          data.classes.forEach((clazz) => {
            statuses = statuses.remove(clazz);
          });
        }
        return items.set(groupIndex, {
          ...current,
          status: statuses.toJS() as EntityStatuses[],
        });
      });
    }
    case CombatSetStatusAction.typeId: {
      console.warn('CLEAR STATUS NEEDS IMPL');
      return state;
    }
    case CombatEncounterReadyAction.typeId: {
      return state.merge({ loading: true });
    }
    case CombatVictoryAction.typeId: {
      return state;
    }
    case CombatEscapeAction.typeId: {
      return state;
    }
    case CombatEscapeCompleteAction.typeId: {
      // We're done here, reset state
      return combatStateFactory();
    }
    case CombatVictoryCompleteAction.typeId: {
      // We're done here, reset state
      return combatStateFactory();
    }
    case CombatAttackAction.typeId: {
      const data: CombatAttack = action.payload;
      const matchDefender = (c?: CombatantTypes) => c?.eid === data.defender.eid;
      assertTrue(state.type !== 'none', 'invalid encounter for attack action');

      // Attacking enemy
      let index = state.enemies.findIndex(matchDefender);
      if (index !== -1) {
        return state.update('enemies', (items: List<CombatantTypes>) => {
          const current = items.get(index);
          assertTrue(current, 'invalid target for attack action');
          const newHp: number = Math.min(
            current.maxhp || 10000,
            Math.max(current.hp - data.damage, 0)
          );
          return items.set(index, {
            ...current,
            hp: newHp,
          });
        });
      }

      index = state.party.findIndex(matchDefender);
      // Attacking party
      if (index !== -1) {
        return state.update('party', (items: List<CombatantTypes>) => {
          const current = items.get(index);
          assertTrue(current, 'invalid target for attack action');
          const newHp: number = Math.min(
            current.maxhp || 10000,
            Math.max(current.hp - data.damage, 0)
          );
          return items.set(index, {
            ...current,
            hp: newHp,
          });
        });
      }
      assertTrue(
        index !== -1,
        'attack target found in neither enemies nor party lists'
      );
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

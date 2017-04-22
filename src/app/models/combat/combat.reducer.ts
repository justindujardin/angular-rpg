import {CombatActions, CombatActionTypes} from './combat.actions';
import {CombatState} from './combat.model';
import * as Immutable from 'immutable';

const initialState: CombatState = {
  loading: false,
  encounter: null
};

export function combatReducer(state: CombatState = initialState, action: CombatActions): CombatState {
  switch (action.type) {
    case CombatActionTypes.FIXED_ENCOUNTER: {
      const encounter = Immutable.Map(action.payload).merge({type: 'fixed'});
      return Immutable.Map(state).merge({
        loading: true,
        encounter
      }).toJS();
    }
    case CombatActionTypes.RANDOM_ENCOUNTER: {
      const encounter = Immutable.Map(action.payload).merge({type: 'random'});
      return Immutable.Map(state).merge({
        loading: true,
        encounter
      }).toJS();
    }
    case CombatActionTypes.ACTION_ATTACK: {

      console.log(`attackCombatant for: ${JSON.stringify(action.payload, null, 2)}`);
      return state;
    }
    default:
      return state;
  }
}

/** @internal {@see sliceCombatState} */
export const sliceCombatLoading = (state: CombatState) => state.loading;
/** @internal {@see sliceCombatState} */
export const sliceCombatEncounter = (state: CombatState) => state.encounter;
/** @internal {@see sliceCombatState} */
export const sliceCombatEncounterEnemies = (state: CombatState) => state.encounter ? state.encounter.enemies : [];
/** @internal {@see sliceCombatState} */
export const sliceCombatEncounterParty = (state: CombatState) => state.encounter ? state.encounter.party : [];

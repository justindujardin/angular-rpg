import {CombatActionTypes, CombatActions} from './combat.actions';
import {CombatState, CombatFixedEncounter} from './combat.model';
import * as Immutable from 'immutable';


const initialState: CombatState = {
  loading: false,
  current: -1,
  encounters: []
};

export function combatReducer(state: CombatState = initialState, action: CombatActions): CombatState {
  switch (action.type) {
    case CombatActionTypes.FIXED_ENCOUNTER: {
      const encounter = Immutable.Map(action.payload).merge({type: 'fixed'});
      return Immutable.Map(state).merge({
        loading: true,
        encounters: [...state.encounters, encounter]
      }).toJS();
    }
    case CombatActionTypes.RANDOM_ENCOUNTER: {
      const encounter = Immutable.Map(action.payload).merge({type: 'random'});
      return Immutable.Map(state).merge({
        loading: true,
        encounters: [...state.encounters, encounter]
      }).toJS();
    }
    default:
      return state;
  }
}

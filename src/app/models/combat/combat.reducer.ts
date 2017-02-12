import {CombatActionTypes, CombatActions} from './combat.actions';
import {CombatState, CombatCurrentType, Combatant} from './combat.model';
import * as Immutable from 'immutable';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Rx';

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

/** Observable of the current encounter */
export function getEncounter(state$: Store<AppState>): Observable<CombatCurrentType> {
  return state$.select((state) => state.combat.encounter);
}

/** Observable of the current encounters' enemies */
export function getEncounterEnemies(state$: Store<AppState>): Observable<Combatant[]> {
  return state$
    .select((state) => state.combat.encounter)
    .map((e) => e ? e.enemies : []);
}

/** Observable of the combat loading boolean */
export function getLoading(state$: Store<AppState>): Observable<CombatCurrentType> {
  return state$.select((state) => state.combat.loading);
}

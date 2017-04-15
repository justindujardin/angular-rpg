import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Effect, Actions} from '@ngrx/effects';
import {
  CombatActionTypes,
  CombatFixedEncounterReadyAction,
  CombatFixedEncounterAction,
  CombatFixedEncounterErrorAction
} from './combat.actions';
import {CombatService} from '../../services/combat.service';
import {CombatEncounter} from './combat.model';

@Injectable()
export class CombatEffects {

  constructor(private actions$: Actions, private combatService: CombatService) {
  }

  @Effect() beginFixedCombat$ = this.actions$.ofType(CombatActionTypes.FIXED_ENCOUNTER)
    .switchMap((action: CombatFixedEncounterAction) => {
      return this.combatService.loadEncounter(action.payload);
    })
    .map((encounter: CombatEncounter) => {
      return new CombatFixedEncounterReadyAction(encounter);
    })
    .catch((e) => {
      return Observable.of(new CombatFixedEncounterErrorAction(e.toString()));
    });

}

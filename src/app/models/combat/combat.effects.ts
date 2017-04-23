import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Effect, Actions} from '@ngrx/effects';
import {
  CombatActionTypes,
  CombatEncounterReadyAction,
  CombatEncounterErrorAction,
  CombatEncounterAction
} from './combat.actions';
import {CombatService} from '../../services/combat.service';
import {CombatEncounter} from './combat.model';

@Injectable()
export class CombatEffects {

  constructor(private actions$: Actions, private combatService: CombatService) {
  }

  @Effect() beginCombat$ = this.actions$.ofType(CombatActionTypes.ENCOUNTER)
    .switchMap((action: CombatEncounterAction) => {
      return this.combatService.loadEncounter(action.payload);
    })
    .map((encounter: CombatEncounter) => {
      return new CombatEncounterReadyAction(encounter);
    })
    .catch((e) => {
      return Observable.of(new CombatEncounterErrorAction(e.toString()));
    });

}

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {
  GameStateActionTypes,
  GameStateLoadSuccessAction,
  GameStateLoadFailAction,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction
} from './game-state.actions';
import {Effect, Actions} from '@ngrx/effects';
import {GameState} from './game-state.model';
import {GameStateService} from '../../services/game-state.service';
import {Action} from '@ngrx/store';
import {
  CombatActionTypes, CombatActions, CombatFixedEncounterReadyAction,
  CombatFixedEncounterAction
} from './combat.actions';

@Injectable()
export class CombatEffects {

  constructor(private actions$: Actions, private combatService: CombatService) {
  }

  @Effect() beginFixedCombat$ = this.actions$.ofType(CombatActionTypes.FIXED_ENCOUNTER)
    .switchMap((action: CombatActions) => {
      return this.combatService.loadMap('combat').map(() => action);
    })
    .map((action: CombatFixedEncounterAction) => {
      return new CombatFixedEncounterReadyAction(action.payload);
    })
    .catch((e) => {
      return Observable.of(new GameStateTravelFailAction(e.toString()));
    });

}

import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {
  GameStateActionTypes,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction
} from './models/game-state/game-state.actions';
import {LoadingService} from './components/loading';
import {CombatActionTypes, CombatActions} from './models/combat/combat.actions';
import {CombatEncounter} from './models/combat/combat.model';
import {replace} from '@ngrx/router-store';

@Injectable()
export class AppEffects {

  constructor(private actions$: Actions, private loadingService: LoadingService) {
  }

  // When the game is loading or traveling, show the loading ui.
  @Effect({dispatch: false}) loadingIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL)
    .distinctUntilChanged()
    .do((action: GameStateTravelAction) => {
      console.log("Traveling to " + action.payload);
      this.loadingService.message = `Traveling to ${action.payload.map}...`;
      this.loadingService.loading = true;
    });
  // When the game is loading or traveling, show the loading ui.
  @Effect({dispatch: false}) loadingDoneIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL_SUCCESS, GameStateActionTypes.TRAVEL_FAIL)
    .distinctUntilChanged()
    .do((action: GameStateTravelSuccessAction|GameStateTravelFailAction) => {
      console.log("Traveling completed with result " + action.payload);
      this.loadingService.loading = false;
    });


  /** route update to combat encounter */
  @Effect() navigateToCombatRoute$ = this.actions$
    .ofType(CombatActionTypes.FIXED_ENCOUNTER, CombatActionTypes.RANDOM_ENCOUNTER)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: CombatActions) => {
      const encounter: CombatEncounter = action.payload;
      return replace(['combat', encounter.id]);
    });


  /** route update to world map */
  @Effect() navigateToWorldRoute$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL_SUCCESS)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: GameStateTravelSuccessAction) => {
      return replace(['world', action.payload]);
    });
}

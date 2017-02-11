import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {
  GameStateActionTypes, GameStateTravelAction,
  GameStateTravelSuccessAction
} from "../../models/game-state/game-state.actions";
import {CombatAttack, CombatEncounter} from "../../models/combat/combat.model";
import {CombatActionTypes, CombatActions} from "../../models/combat/combat.actions";
import {replace} from "@ngrx/router-store";
import {LoadingService} from "../../components/loading/loading.service";

@Injectable()
export class CombatEffects {

  constructor(private actions$: Actions, private loadingService: LoadingService) {
  }

  // When the game is loading or traveling, show the loading ui.
  @Effect({dispatch: false}) loadingIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL)
    .distinctUntilChanged()
    .do((action: GameStateTravelAction) => {
      this.loadingService.message = `Traveling to ${action.payload.map}...`;
      this.loadingService.loading = true;
    });
  // When the game is loading or traveling, show the loading ui.
  @Effect({dispatch: false}) loadingDoneIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL_SUCCESS, GameStateActionTypes.TRAVEL_FAIL)
    .distinctUntilChanged()
    .do((action: CombatAttack): void => {
      this.loadingService.loading = false;
    });


  /** route update to combat encounter */
  @Effect() navigateToCombatRoute$ = this.actions$
    .ofType(CombatActionTypes.FIXED_ENCOUNTER, CombatActionTypes.RANDOM_ENCOUNTER)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: CombatActions) => {
      const encounter = action.payload as CombatEncounter;
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

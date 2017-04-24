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
import {replace} from '@ngrx/router-store';
import {CombatEncounter} from './models/combat/combat.model';
import {assertTrue} from './models/util';

/**
 * AppComponent effects describe the navigation side-effects of various game actions.
 */
@Injectable()
export class AppEffects {

  constructor(private actions$: Actions, private loadingService: LoadingService) {
  }

  /** When the game is loading or traveling, show the loading ui. */
  @Effect({dispatch: false}) loadingIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL)
    .distinctUntilChanged()
    .do((action: GameStateTravelAction) => {
      this.loadingService.message = `Traveling to ${action.payload.map}...`;
      this.loadingService.loading = true;
    });
  /** When the game is done loading or traveling, hide the loading ui. */
  @Effect({dispatch: false}) loadingDoneIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL_SUCCESS, GameStateActionTypes.TRAVEL_FAIL)
    .distinctUntilChanged()
    .do((action: GameStateTravelSuccessAction | GameStateTravelFailAction) => {
      this.loadingService.loading = false;
    });

  /** route update to combat encounter */
  @Effect() navigateToCombatRoute$ = this.actions$
    .ofType(CombatActionTypes.ENCOUNTER_READY)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: CombatActions) => {
      const encounter = action.payload as CombatEncounter;
      assertTrue(encounter.id || encounter.zone, 'combat must either be in a zone or have an id');
      return replace(['combat', encounter.id || encounter.zone]);
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

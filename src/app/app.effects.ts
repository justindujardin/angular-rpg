import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {
  GameStateActionTypes,
  GameStateLoadSuccessAction,
  GameStateTravelAction,
  GameStateSaveAction,
  GameStateLoadAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction
} from './models/game-state/game-state.actions';
import {replace} from '@ngrx/router-store';
import {LoadingService} from './components/loading';

@Injectable()
export class AppEffects {

  constructor(private actions$: Actions, private loading: LoadingService) {
  }

  // When the game state is loaded, update the route
  @Effect() gameStateLoaded$ = this.actions$
    .ofType(GameStateActionTypes.LOAD_SUCCESS)
    .distinctUntilChanged()
    .map((action: GameStateLoadSuccessAction) => {
      return replace(['world', action.payload.map]);
    });

  // When the game is loading or traveling, show the loading ui.
  @Effect({dispatch: false}) loadingIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL)
    .distinctUntilChanged()
    .do((action: GameStateTravelAction|GameStateSaveAction|GameStateLoadAction) => {
      console.log("Traveling to " + action.payload);
      this.loading.loading = true;
    });
  // When the game is loading or traveling, show the loading ui.
  @Effect({dispatch: false}) loadingDoneIndicator$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL_SUCCESS, GameStateActionTypes.TRAVEL_FAIL)
    .distinctUntilChanged()
    .do((action: GameStateTravelSuccessAction|GameStateTravelFailAction) => {
      console.log("Traveling completed with result " + action.payload);
      this.loading.loading = false;
    });
}

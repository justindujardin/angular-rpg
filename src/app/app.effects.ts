import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction
} from './models/game-state/game-state.actions';
import {LoadingService} from './components/loading';
import {replace} from '@ngrx/router-store';

/**
 * AppComponent effects describe the navigation side-effects of various game actions.
 */
@Injectable()
export class AppEffects {

  constructor(private actions$: Actions, private loadingService: LoadingService) {
  }

  /** When the game is loading or traveling, show the loading ui. */
  @Effect({dispatch: false}) loadingIndicator$ = this.actions$
    .ofType(GameStateTravelAction.typeId)
    .distinctUntilChanged()
    .do((action: GameStateTravelAction) => {
      this.loadingService.message = `Traveling to ${action.payload.location}...`;
      this.loadingService.loading = true;
    });
  /** When the game is done loading or traveling, hide the loading ui. */
  @Effect({dispatch: false}) loadingDoneIndicator$ = this.actions$
    .ofType(GameStateTravelSuccessAction.typeId, GameStateTravelFailAction.typeId)
    .distinctUntilChanged()
    .do((action: GameStateTravelSuccessAction | GameStateTravelFailAction) => {
      this.loadingService.loading = false;
    });

  /** route update to world map */
  @Effect() navigateToWorldRoute$ = this.actions$
    .ofType(GameStateTravelSuccessAction.typeId)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: GameStateTravelSuccessAction) => {
      return replace(['world', action.payload]);
    });
}

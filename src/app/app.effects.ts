import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { LoadingService } from './components/loading';
import {
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction,
} from './models/game-state/game-state.actions';

/**
 * AppComponent effects describe the navigation side-effects of various game actions.
 */
@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  /** When the game is loading or traveling, show the loading ui. */
  @Effect({ dispatch: false }) loadingIndicator$ = this.actions$.pipe(
    ofType(GameStateTravelAction.typeId),
    distinctUntilChanged(),
    map((action: GameStateTravelAction) => {
      this.loadingService.message = `Traveling to ${action.payload.location}...`;
      this.loadingService.loading = true;
    })
  );
  /** When the game is done loading or traveling, hide the loading ui. */
  @Effect({ dispatch: false }) loadingDoneIndicator$ = this.actions$.pipe(
    ofType(GameStateTravelSuccessAction.typeId, GameStateTravelFailAction.typeId),
    distinctUntilChanged(),
    map((action: GameStateTravelSuccessAction | GameStateTravelFailAction) => {
      this.loadingService.loading = false;
    })
  );

  /** route update to world map */
  @Effect({ dispatch: false }) navigateToWorldRoute$ = this.actions$.pipe(
    ofType(GameStateTravelSuccessAction.typeId),
    debounceTime(100),
    distinctUntilChanged(),
    map((action: GameStateTravelSuccessAction) => {
      this.router.navigate(['world', action.payload]);
    })
  );
}

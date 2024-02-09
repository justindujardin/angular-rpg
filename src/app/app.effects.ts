import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
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
    private loadingService: LoadingService,
  ) {}

  /** When the game is loading or traveling, show the loading ui. */
  loadingIndicator$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GameStateTravelAction.typeId),
        distinctUntilChanged(),
        map((action: GameStateTravelAction) => {
          this.loadingService.message = `Traveling to ${action.payload.location}...`;
          this.loadingService.loading = true;
        }),
      ),
    { dispatch: false },
  );
  /** When the game is done loading or traveling, hide the loading ui. */
  loadingDoneIndicator$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GameStateTravelSuccessAction.typeId, GameStateTravelFailAction.typeId),
        distinctUntilChanged(),
        map((action: GameStateTravelSuccessAction | GameStateTravelFailAction) => {
          this.loadingService.loading = false;
        }),
      ),
    { dispatch: false },
  );

  /** route update to world map */
  navigateToWorldRoute$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GameStateTravelSuccessAction.typeId),
        debounceTime(100),
        distinctUntilChanged(),
        map((action: GameStateTravelSuccessAction) => {
          this.router.navigate(['world', action.payload]);
        }),
      ),
    { dispatch: false },
  );
}

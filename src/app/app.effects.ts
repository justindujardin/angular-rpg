import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {GameStateActions} from './models/game-state/game-state.actions';
import {Action} from '@ngrx/store';
import {replace} from '@ngrx/router-store';

@Injectable()
export class AppEffects {

  constructor(private actions$: Actions) {
  }

  // When the game state is loaded, update the route
  @Effect() gameStateLoaded$ = this.actions$
    .ofType(GameStateActions.LOAD_COMPLETED)
    .distinctUntilChanged()
    .map((action: Action) => {
      return replace(['world', action.payload.map]);
    });
}

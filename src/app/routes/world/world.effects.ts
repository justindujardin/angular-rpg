import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {
  GameStateActionTypes,
  GameStateTravelSuccessAction
} from '../../models/game-state/game-state.actions';
import {replace} from '@ngrx/router-store';

@Injectable()
export class WorldEffects {
  constructor(private actions$: Actions) {
  }

  /** Load the TMX resource needed for files when the map is changed */
  @Effect() preloadMap$ = this.actions$
    .ofType(GameStateActionTypes.TRAVEL_SUCCESS)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: GameStateTravelSuccessAction) => {
      return replace(['world', action.payload]);
    });
}

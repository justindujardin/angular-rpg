import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {Effect, Actions} from '@ngrx/effects';
import {GameStateActions} from '../../models/game-state/game-state.actions';
import {go, replace} from '@ngrx/router-store';

@Injectable()
export class WorldEffects {
  constructor(private actions$: Actions) {
  }

  /** Load the TMX resource needed for files when the map is changed */
  @Effect() preloadMap$ = this.actions$
    .ofType(GameStateActions.SET_MAP)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: Action) => {
      return replace(['world', action.payload]);
    });
}

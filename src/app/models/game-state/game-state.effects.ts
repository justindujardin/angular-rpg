import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {GameStateActions} from './game-state.actions';
import {Effect, Actions} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';

@Injectable()
export class GameStateEffects {

  constructor(private actions$: Actions,
              private store: Store<AppState>,
              private gameStateActions: GameStateActions) {
  }


  // switchMap -> world.ready$
  // router navigate to state map
  //
  @Effect() loadedGame$ = this.actions$.ofType(GameStateActions.LOAD)
    .debounce(() => Observable.interval(10))
    .map((action) => {
      return this.gameStateActions.loadCompleted(action.payload);
    })
    .catch((e) => {
      return Observable.of(this.gameStateActions.loadFailed(e.toString()));
    });

}

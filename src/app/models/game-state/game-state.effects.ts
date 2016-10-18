import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {
  GameStateActionTypes,
  GameStateLoadSuccessAction,
  GameStateLoadFailAction,
  GameStateTravelAction, GameStateTravelFailAction, GameStateTravelSuccessAction
} from './game-state.actions';
import {Effect, Actions} from '@ngrx/effects';

@Injectable()
export class GameStateEffects {

  constructor(private actions$: Actions) {
  }

  // switchMap -> world.ready$
  // router navigate to state map
  //
  @Effect() loadedGame$ = this.actions$.ofType(GameStateActionTypes.LOAD)
    .debounceTime(10)
    .map((action) => {
      return new GameStateLoadSuccessAction(action.payload);
    })
    .catch((e) => {
      return Observable.of(new GameStateLoadFailAction(e.toString()));
    });

  @Effect() travel$ = this.actions$.ofType(GameStateActionTypes.TRAVEL)
    .debounceTime(10)
    .map((action: GameStateTravelAction) => {
      return new GameStateTravelSuccessAction(action.payload.map);
    })
    .catch((e) => {
      return Observable.of(new GameStateTravelFailAction(e.toString()));
    });

}

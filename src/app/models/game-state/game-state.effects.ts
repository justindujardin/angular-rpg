import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {
  GameStateActionTypes,
  GameStateLoadSuccessAction,
  GameStateLoadFailAction,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction
} from './game-state.actions';
import {Effect, Actions} from '@ngrx/effects';
import {GameState} from './game-state.model';

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

  // After a successful game load, travel to the current location
  //
  @Effect() afterLoadTravelToCurrentLocation$ = this.actions$
    .ofType(GameStateActionTypes.LOAD_SUCCESS)
    .debounceTime(10)
    .map((action) => {
      const gameState: GameState = action.payload;
      return new GameStateTravelAction(gameState.map, gameState.position);
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

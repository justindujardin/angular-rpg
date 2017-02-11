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
import {GameStateService} from './game-state.service';
import {Action} from '@ngrx/store';

@Injectable()
export class GameStateEffects {

  constructor(private actions$: Actions, private gameStateService: GameStateService) {
  }

  /**
   * When a load action is dispatched, async load the state and then dispatch
   * a Success action.
   */
  @Effect() initLoadedGame$ = this.actions$.ofType(GameStateActionTypes.LOAD)
    .map((action: Action) => {
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
    .switchMap((action: GameStateTravelAction) => {
      return this.gameStateService
        .loadMap(action.payload.map)
        .map(() => action.payload.map);
    })
    // TODO: This debounce is to let the UI transition to a loading screen for at least and appropriate
    //       amount of time to let the map hide (to flashes of camera movement and map changing)
    .debounceTime(1000)
    .map((map: string) => {
      return new GameStateTravelSuccessAction(map);
    })
    .catch((e) => {
      return Observable.of(new GameStateTravelFailAction(e.toString()));
    });

}

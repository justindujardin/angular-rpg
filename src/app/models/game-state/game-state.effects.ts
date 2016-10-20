import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {
  GameStateActionTypes,
  GameStateLoadSuccessAction,
  GameStateLoadFailAction,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction,
  GameStateLoadAction
} from './game-state.actions';
import {Effect, Actions} from '@ngrx/effects';
import {GameState} from './game-state.model';
import {GameStateService} from '../../services/game-state.service';

@Injectable()
export class GameStateEffects {

  constructor(private actions$: Actions, private gameStateService: GameStateService) {
  }

  // switchMap -> world.ready$
  // router navigate to state map
  //
  @Effect() loadedGame$ = this.actions$.ofType(GameStateActionTypes.LOAD)
    .switchMap((a: GameStateLoadAction) => {
      return this.gameStateService.loadGame(a.payload);
    })
    .map((g: GameState) => {
      return new GameStateLoadSuccessAction(g);
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
    .map((map: string) => {
      return new GameStateTravelSuccessAction(map);
    })
    .catch((e) => {
      return Observable.of(new GameStateTravelFailAction(e.toString()));
    });

}

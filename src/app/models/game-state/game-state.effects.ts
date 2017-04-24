import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {
  GameStateActionTypes,
  GameStateLoadSuccessAction,
  GameStateLoadFailAction,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction,
  GameStateSaveSuccessAction,
  GameStateSaveFailAction,
  GameStateLoadAction
} from './game-state.actions';
import {Effect, Actions} from '@ngrx/effects';
import {GameState} from './game-state.model';
import {GameStateService} from './game-state.service';
import {Store} from '@ngrx/store';
import {NotificationService} from '../../components/notification/notification.service';
import {AppState} from '../../app.model';

@Injectable()
export class GameStateEffects {

  constructor(private actions$: Actions,
              private notify: NotificationService,
              private store: Store<AppState>,
              private gameStateService: GameStateService) {
  }

  /**
   * When a load action is dispatched, async load the state and then dispatch
   * a Success action.
   */
  @Effect() initLoadedGame$ = this.actions$.ofType(GameStateActionTypes.LOAD)
    .switchMap((action: GameStateLoadAction) => this.gameStateService.load())
    .map((state: AppState) => new GameStateLoadSuccessAction(state))
    .catch((e) => {
      return Observable.of(new GameStateLoadFailAction(e.toString()));
    });

  /**
   * When a save action is dispatched, serialize the app state to local storage.
   */
  @Effect() saveGameState$ = this.actions$.ofType(GameStateActionTypes.SAVE)
    .switchMap(() => this.store.take(1))
    .map((state: AppState) => this.gameStateService.save(state))
    .map(() => new GameStateSaveSuccessAction())
    .catch((e) => {
      return Observable.of(new GameStateSaveFailAction(e.toString()));
    });

  /** When the game has been saved, notify the user. */
  @Effect({dispatch: false}) saveGameSuccess$ = this.actions$
    .ofType(GameStateActionTypes.SAVE_SUCCESS)
    .do(() => {
      this.notify.show('Game state saved!  Nice.');
    });

  /**
   * After a successful game create/load, travel to the initial location
   */
  @Effect() afterLoadTravelToCurrentLocation$ = this.actions$
    .ofType(GameStateActionTypes.NEW_SUCCESS, GameStateActionTypes.LOAD_SUCCESS)
    .debounceTime(10)
    .map((action) => {
      let gameState: GameState;
      switch (action.type) {
        case GameStateActionTypes.NEW_SUCCESS:
          gameState = action.payload;
          break;
        case GameStateActionTypes.LOAD_SUCCESS:
          gameState = action.payload.gameState;
          break;
        default:
          return;
      }
      return new GameStateTravelAction(gameState.map, gameState.position);
    });

  @Effect() travel$ = this.actions$.ofType(GameStateActionTypes.TRAVEL)
    .switchMap((action: GameStateTravelAction) => {
      return this.gameStateService.loadMap(action.payload.map)
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

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {
  GameStateDeleteAction, GameStateDeleteFailAction, GameStateDeleteSuccessAction,
  GameStateLoadAction,
  GameStateLoadFailAction,
  GameStateLoadSuccessAction,
  GameStateNewSuccessAction,
  GameStateSaveAction,
  GameStateSaveFailAction,
  GameStateSaveSuccessAction,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction
} from './game-state.actions';
import {Actions, Effect} from '@ngrx/effects';
import {GameState} from './game-state.model';
import {GameStateService} from './game-state.service';
import {NotificationService} from '../../components/notification/notification.service';
import {AppState} from '../../app.model';

@Injectable()
export class GameStateEffects {

  constructor(private actions$: Actions,
              private notify: NotificationService,
              private gameStateService: GameStateService) {
  }

  /**
   * When a load action is dispatched, async load the state and then dispatch
   * a Success action.
   */
  @Effect() initLoadedGame$ = this.actions$.ofType(GameStateLoadAction.typeId)
    .switchMap((action: GameStateLoadAction) => this.gameStateService.load())
    .map((state: AppState) => new GameStateLoadSuccessAction(state))
    .catch((e) => {
      return Observable.of(new GameStateLoadFailAction(e.toString()));
    });

  /**
   * When a save action is dispatched, serialize the app state to local storage.
   */
  @Effect() saveGameState$ = this.actions$.ofType(GameStateSaveAction.typeId)
    .switchMap(() => this.gameStateService.save())
    .map(() => new GameStateSaveSuccessAction())
    .catch((e) => {
      return Observable.of(new GameStateSaveFailAction(e.toString()));
    });

  /** When the game has been saved, notify the user. */
  @Effect({dispatch: false}) saveGameSuccess$ = this.actions$
    .ofType(GameStateSaveSuccessAction.typeId)
    .do(() => {
      this.notify.show('Game state saved!  Nice.');
    });

  /**
   * When a delete action is dispatched, remove the saved state in localstorage.
   */
  @Effect() clearGameState$ = this.actions$.ofType(GameStateDeleteAction.typeId)
    .switchMap(() => this.gameStateService.resetGame())
    .map(() => new GameStateDeleteSuccessAction())
    .catch((e) => {
      return Observable.of(new GameStateDeleteFailAction(e.toString()));
    });

  /** When game data is deleted, notify the user. */
  @Effect({dispatch: false}) clearGameSuccess$ = this.actions$
    .ofType(GameStateDeleteSuccessAction.typeId)
    .do(() => {
      this.notify.show('Game data deleted.  Next time you refresh you will begin a new game.');
    });

  /**
   * After a successful game create/load, travel to the initial location
   */
  @Effect() afterLoadTravelToCurrentLocation$ = this.actions$
    .ofType(GameStateNewSuccessAction.typeId, GameStateLoadSuccessAction.typeId)
    .debounceTime(10)
    .map((action) => {
      let gameState: GameState;
      switch (action.type) {
        case GameStateNewSuccessAction.typeId:
          gameState = action.payload;
          break;
        case GameStateLoadSuccessAction.typeId:
          gameState = action.payload.gameState;
          break;
        default:
          return;
      }
      return new GameStateTravelAction(gameState);
    });

  @Effect() travel$ = this.actions$.ofType(GameStateTravelAction.typeId)
    .switchMap((action: GameStateTravelAction) => {
      return this.gameStateService.loadMap(action.payload.location)
        .map(() => action.payload.location);
    })
    // TODO: This debounce is to let the UI transition to a loading screen for at least and appropriate
    //       amount of time to let the map hide (to flashes of camera movement and map changing)
    .debounceTime(10)
    .map((map: string) => {
      return new GameStateTravelSuccessAction(map);
    })
    .catch((e) => {
      return Observable.of(new GameStateTravelFailAction(e.toString()));
    });

}

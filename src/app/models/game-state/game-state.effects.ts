import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { NotificationService } from '../../components/notification/notification.service';
import {
  GameStateDeleteAction,
  GameStateDeleteFailAction,
  GameStateDeleteSuccessAction,
  GameStateLoadAction,
  GameStateLoadFailAction,
  GameStateLoadSuccessAction,
  GameStateNewSuccessAction,
  GameStateSaveAction,
  GameStateSaveFailAction,
  GameStateSaveSuccessAction,
  GameStateTravelAction,
  GameStateTravelFailAction,
  GameStateTravelSuccessAction,
} from './game-state.actions';
import { GameState } from './game-state.model';
import { GameStateService } from './game-state.service';

@Injectable()
export class GameStateEffects {
  constructor(
    private actions$: Actions,
    private notify: NotificationService,
    private gameStateService: GameStateService,
  ) {}

  /**
   * When a load action is dispatched, async load the state and then dispatch
   * a Success action.
   */
  initLoadedGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameStateLoadAction.typeId),
      switchMap((action: GameStateLoadAction) => this.gameStateService.load()),
      map((state: AppState) => new GameStateLoadSuccessAction(state)),
      catchError((e) => {
        return of(new GameStateLoadFailAction(e.toString()));
      }),
    ),
  );

  /**
   * When a save action is dispatched, serialize the app state to local storage.
   */
  saveGameState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameStateSaveAction.typeId),
      switchMap(() => this.gameStateService.save()),
      map(() => new GameStateSaveSuccessAction()),
      catchError((e) => {
        return of(new GameStateSaveFailAction(e.toString()));
      }),
    ),
  );

  /**
   * When a delete action is dispatched, remove the saved state in localstorage.
   */
  clearGameState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameStateDeleteAction.typeId),
      switchMap(() => this.gameStateService.resetGame()),
      map(() => new GameStateDeleteSuccessAction()),
      catchError((e) => {
        return of(new GameStateDeleteFailAction(e.toString()));
      }),
    ),
  );

  /** When game data is deleted, notify the user. */
  clearGameSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GameStateDeleteSuccessAction.typeId),
        tap(() => {
          this.notify.show(
            'Game data deleted.  Next time you refresh you will begin a new game.',
          );
        }),
      ),
    { dispatch: false },
  );

  /**
   * After a successful game create/load, travel to the initial location
   */
  afterLoadTravelToCurrentLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameStateNewSuccessAction.typeId, GameStateLoadSuccessAction.typeId),
      debounceTime(10),
      map((action: GameStateNewSuccessAction | GameStateLoadSuccessAction) => {
        let gameState: GameState;
        switch (action.type) {
          case GameStateNewSuccessAction.typeId:
            gameState = action.payload;
            break;
          case GameStateLoadSuccessAction.typeId:
            gameState = action.payload.gameState;
            break;
        }
        return new GameStateTravelAction(gameState);
      }),
    ),
  );

  travel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameStateTravelAction.typeId),
      switchMap((action: GameStateTravelAction) => {
        return this.gameStateService
          .loadMap(action.payload.location)
          .pipe(map(() => action.payload.location));
      }),
      // TODO: This debounce is to let the UI transition to a loading screen for at least and appropriate
      //       amount of time to let the map hide (to flashes of camera movement and map changing)
      debounceTime(10),
      map((newMap: string) => {
        return new GameStateTravelSuccessAction(newMap);
      }),
      catchError((e) => {
        return of(new GameStateTravelFailAction(e.toString()));
      }),
    ),
  );
}

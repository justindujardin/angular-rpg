import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {GameDataService} from './game-data.service';
import {GameDataFetchAction, GameDataFetchFailAction, GameDataFetchSuccessAction} from './game-data.actions';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class GameDataEffects {

  constructor(private actions$: Actions,
              private gameDataService: GameDataService) {
  }

  /**
   * Load game data into the store from a remote spreadsheet
   */
  @Effect() loadSpreadsheetData$ = this.actions$.ofType(GameDataFetchAction.typeId)
    .switchMap((action: GameDataFetchAction) => {
      return this.gameDataService.loadGameData(action.payload).map(() => action.payload);
    })
    .map((url: string) => {
      return new GameDataFetchSuccessAction(url);
    })
    .catch((e) => {
      return Observable.of(new GameDataFetchFailAction(e.toString()));
    });
}

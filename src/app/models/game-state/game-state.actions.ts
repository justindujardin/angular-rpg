import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {GameState} from './game-state.model';

@Injectable()

export class GameStateActions {

  static LOAD = '[GameState] Load State';

  load(item: GameState): Action {
    return {
      type: GameStateActions.LOAD,
      payload: item
    };
  }

  static SAVE = '[GameState] Save State';

  save(): Action {
    return {
      type: GameStateActions.LOAD,
      payload: new Date().getTime()
    };
  }
}

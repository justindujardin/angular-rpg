import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {GameState} from './game-state.model';
import {IPoint} from '../../../game/pow-core/point';


@Injectable()
export class GameStateActions {

  static LOAD = 'rpg/state/load';

  load(item: GameState): Action {
    return {
      type: GameStateActions.LOAD,
      payload: item
    };
  }

  static LOAD_FAILED = 'rpg/state/load/failed';

  loadFailed(error: string): Action {
    return {
      type: GameStateActions.LOAD_FAILED,
      payload: error
    };
  }

  static LOAD_COMPLETED = 'rpg/state/load/completed';

  loadCompleted(item: GameState): Action {
    return {
      type: GameStateActions.LOAD_COMPLETED,
      payload: item
    };
  }

  static SAVE = 'rpg/state/save';

  save(): Action {
    return {
      type: GameStateActions.LOAD,
      payload: new Date().getTime()
    };
  }

  static SET_MAP = 'rpg/state/set/map';

  setMap(map: string): Action {
    return {
      type: GameStateActions.SET_MAP,
      payload: map
    };
  }

  static SET_POSITION = 'rpg/state/set/position';

  setMapPosition(position: IPoint): Action {
    return {
      type: GameStateActions.SET_POSITION,
      payload: position
    };
  }
}

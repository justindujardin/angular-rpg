import {Action} from '@ngrx/store';
import {GameState} from './game-state.model';
import {type} from '../util';
import {IPoint} from '../../../game/pow-core';


export const GameStateActionTypes = {
  LOAD: type('rpg/state/load'),
  LOAD_SUCCESS: type('rpg/state/load-success'),
  LOAD_FAIL: type('rpg/state/load-fail'),
  SAVE: type('rpg/state/save'),
  SAVE_SUCCESS: type('rpg/state/save-success'),
  SAVE_FAIL: type('rpg/state/save-fail'),
  TRAVEL: type('rpg/state/travel'),
  TRAVEL_SUCCESS: type('rpg/state/travel-success'),
  TRAVEL_FAIL: type('rpg/state/travel-fail'),
};


//
// Load state Actions
//
export class GameStateLoadAction implements Action {
  type = GameStateActionTypes.LOAD;

  constructor(public payload: GameState) {
  }
}

export class GameStateLoadSuccessAction implements Action {
  type = GameStateActionTypes.LOAD_SUCCESS;

  constructor(public payload: GameState) {
  }
}

export class GameStateLoadFailAction implements Action {
  type = GameStateActionTypes.LOAD_FAIL;

  constructor(public payload: any) {
  }
}

//
// Save state Actions
//
export class GameStateSaveAction implements Action {
  type = GameStateActionTypes.SAVE;

  constructor(public payload: GameState) {
  }
}

export class GameStateSaveSuccessAction implements Action {
  type = GameStateActionTypes.SAVE_SUCCESS;

  constructor(public payload: GameState) {
  }
}

export class GameStateSaveFailAction implements Action {
  type = GameStateActionTypes.SAVE_FAIL;

  constructor(public payload: any) {
  }
}

//
// Travel state actions
//
export class GameStateTravelAction implements Action {
  type = GameStateActionTypes.TRAVEL;

  payload: {
    map: string;
    position: IPoint;
  };

  constructor(map:string, position:IPoint) {
    this.payload = {
      map, position
    };
  }
}

export class GameStateTravelSuccessAction implements Action {
  type = GameStateActionTypes.TRAVEL_SUCCESS;

  constructor(public payload: string) {
  }
}

export class GameStateTravelFailAction implements Action {
  type = GameStateActionTypes.TRAVEL_FAIL;

  constructor(public payload: any) {
  }
}


export type GameStateActions
  = GameStateLoadAction
  | GameStateLoadSuccessAction
  | GameStateLoadFailAction
  | GameStateSaveAction
  | GameStateSaveSuccessAction
  | GameStateSaveFailAction
  | GameStateTravelAction
  | GameStateTravelSuccessAction
  | GameStateTravelFailAction

import {Action} from '@ngrx/store';
import {GameState, GamePositionFacing} from './game-state.model';
import {type} from '../util';
import {IPoint} from '../../../game/pow-core';


export const GameStateActionTypes = {
  LOAD: type('rpg/state/load'),
  LOAD_SUCCESS: type('rpg/state/load-success'),
  LOAD_FAIL: type('rpg/state/load-fail'),
  TRAVEL: type('rpg/state/travel'),
  TRAVEL_SUCCESS: type('rpg/state/travel-success'),
  TRAVEL_FAIL: type('rpg/state/travel-fail'),
  MOVE: type('rpg/state/move'),
  ADD_GOLD: type('rpg/state/gold'),
  HEAL_PARTY: type('rpg/state/party/heal'),
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
// Travel state actions
//
export class GameStateTravelAction implements Action {
  type = GameStateActionTypes.TRAVEL;

  payload: {
    map: string;
    position: IPoint;
  };

  constructor(map: string, position: IPoint) {
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


//
// Move state actions
//

export interface GameStateMoveData {
  from: IPoint;
  to: IPoint;
  facing: GamePositionFacing;
}

export class GameStateMoveAction implements Action {
  type = GameStateActionTypes.MOVE;

  constructor(public payload: IPoint) {
  }
}


//
// Gold state actions
//
export class GameStateAddGoldAction implements Action {
  type = GameStateActionTypes.ADD_GOLD;

  constructor(public payload: number) {
  }
}


//
// Party state actions
//
export class GameStateHealPartyAction implements Action {
  type = GameStateActionTypes.HEAL_PARTY;

  payload: number;

  constructor(healingCost: number) {
    this.payload = healingCost;
  }
}


export type GameStateActions
  = GameStateLoadAction
  | GameStateLoadSuccessAction
  | GameStateLoadFailAction
  | GameStateTravelAction
  | GameStateTravelSuccessAction
  | GameStateTravelFailAction
  | GameStateMoveAction
  | GameStateAddGoldAction
  | GameStateHealPartyAction

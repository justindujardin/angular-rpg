import {Action} from '@ngrx/store';
import {GameState, GamePositionFacing} from './game-state.model';
import {type} from '../util';
import {IPoint} from '../../../game/pow-core';
import {Item} from '../item';
import {AppState} from '../../app.model';

export const GameStateActionTypes = {
  SAVE: type('rpg/state/save'),
  SAVE_SUCCESS: type('rpg/state/save-success'),
  SAVE_FAIL: type('rpg/state/save-fail'),
  LOAD: type('rpg/state/load'),
  LOAD_SUCCESS: type('rpg/state/load-success'),
  LOAD_FAIL: type('rpg/state/load-fail'),
  NEW: type('rpg/state/new'),
  NEW_SUCCESS: type('rpg/state/new-success'),
  NEW_FAIL: type('rpg/state/new-fail'),
  SET_KEY_DATA: type('rpg/state/set-key-data'),
  TRAVEL: type('rpg/state/travel'),
  TRAVEL_SUCCESS: type('rpg/state/travel-success'),
  TRAVEL_FAIL: type('rpg/state/travel-fail'),
  MOVE: type('rpg/state/move'),
  ADD_GOLD: type('rpg/state/gold'),
  ADD_INVENTORY: type('rpg/state/inventory/add'),
  REMOVE_INVENTORY: type('rpg/state/inventory/remove'),
  HEAL_PARTY: type('rpg/state/entity/heal'),
};

//
// Save state Actions
//
export class GameStateSaveAction implements Action {
  type = GameStateActionTypes.SAVE;
  payload: null = null;

}

export class GameStateSaveSuccessAction implements Action {
  type = GameStateActionTypes.SAVE_SUCCESS;
  payload: string = null;
}

export class GameStateSaveFailAction implements Action {
  type = GameStateActionTypes.SAVE_FAIL;

  constructor(public payload: any) {
  }
}

//
// Load state Actions
//
export class GameStateLoadAction implements Action {
  type = GameStateActionTypes.LOAD;
  payload: void;
}

export class GameStateLoadSuccessAction implements Action {
  type = GameStateActionTypes.LOAD_SUCCESS;

  constructor(public payload: AppState) {
  }
}

export class GameStateLoadFailAction implements Action {
  type = GameStateActionTypes.LOAD_FAIL;

  constructor(public payload: any) {
  }
}

//
// New game state Actions
//
export class GameStateNewAction implements Action {
  type = GameStateActionTypes.NEW;

  constructor(public payload: GameState) {
  }
}

export class GameStateNewSuccessAction implements Action {
  type = GameStateActionTypes.NEW_SUCCESS;

  constructor(public payload: GameState) {
  }
}

export class GameStateNewFailAction implements Action {
  type = GameStateActionTypes.NEW_FAIL;

  constructor(public payload: any) {
  }
}

//
// key/value data for map features and such
//
export class GameStateSetKeyDataAction implements Action {
  type = GameStateActionTypes.SET_KEY_DATA;
  payload: {
    key: string;
    value: any;
  };

  constructor(key: string, value: any) {
    this.payload = {
      key, value
    };
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

  constructor(public payload: {
    cost: number;
    partyIds: string[]
  }) {
  }
}

//
// Inventory actions
//
export class GameStateAddInventoryAction implements Action {
  type = GameStateActionTypes.ADD_INVENTORY;

  constructor(public payload: Item) {
  }
}
export class GameStateRemoveInventoryAction implements Action {
  type = GameStateActionTypes.REMOVE_INVENTORY;

  constructor(public payload: Item) {
  }
}

export type GameStateActions
  = GameStateSaveAction
  | GameStateSaveSuccessAction
  | GameStateSaveFailAction
  | GameStateLoadAction
  | GameStateLoadSuccessAction
  | GameStateLoadFailAction
  | GameStateNewAction
  | GameStateNewSuccessAction
  | GameStateNewFailAction
  | GameStateTravelAction
  | GameStateTravelSuccessAction
  | GameStateTravelFailAction
  | GameStateMoveAction
  | GameStateAddGoldAction
  | GameStateHealPartyAction
  | GameStateAddInventoryAction
  | GameStateRemoveInventoryAction;

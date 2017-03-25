import {type} from '../util';
import {Action} from '@ngrx/store';

export const GameDataActionTypes = {
  ADD_SHEET: type('rpg/data/sheet/add'),
  REMOVE_SHEET: type('rpg/data/sheet/remove')
};

export interface IGameDataAddPayload {
  sheet: string;
  data: any[];
}

export class GameDataAddSheetAction implements Action {
  type: string = GameDataActionTypes.ADD_SHEET;
  payload: IGameDataAddPayload;

  constructor(sheet: string, data: any[]) {
    this.payload = {sheet, data};
  }
}
export class GameDataRemoveSheetAction implements Action {
  type: string = GameDataActionTypes.REMOVE_SHEET;
  payload: string;

  constructor(sheetId: string) {
    this.payload = sheetId;
  }
}

export type GameDataActionClasses = GameDataAddSheetAction | GameDataRemoveSheetAction;

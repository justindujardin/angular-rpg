import {type} from '../util';
import {Action} from '@ngrx/store';

export interface IGameDataAddPayload {
  sheet: string;
  data: any[];
}

export class GameDataAddSheetAction implements Action {
  static typeId: 'DATA_ADD_SHEET' = type('DATA_ADD_SHEET');
  type = GameDataAddSheetAction.typeId;

  payload: IGameDataAddPayload;

  constructor(sheet: string, data: any[]) {
    this.payload = {sheet, data};
  }
}
export class GameDataRemoveSheetAction implements Action {
  static typeId: 'DATA_REMOVE_SHEET' = type('DATA_REMOVE_SHEET');
  type = GameDataRemoveSheetAction.typeId;
  payload: string;

  constructor(sheetId: string) {
    this.payload = sheetId;
  }
}

export type GameDataActionClasses = GameDataAddSheetAction | GameDataRemoveSheetAction;

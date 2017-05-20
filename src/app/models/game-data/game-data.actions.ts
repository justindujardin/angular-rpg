import {type} from '../util';
import {Action} from '@ngrx/store';

export interface IGameDataAddPayload {
  sheet: string;
  data: any[];
}

/**
 * Fetch game data from the given Google Spreadsheet URL.
 *
 * @note The spreadsheet must be published and publicly accessible.
 */
export class GameDataFetchAction implements Action {
  static typeId: 'GAME_DATA_FETCH' = type('GAME_DATA_FETCH');
  type = GameDataFetchAction.typeId;

  payload: string;

  constructor(googleSpreadsheetId: string) {
    this.payload = googleSpreadsheetId;
  }
}
export class GameDataFetchSuccessAction implements Action {
  static typeId: 'GAME_DATA_FETCH_SUCCESS' = type('GAME_DATA_FETCH_SUCCESS');
  type = GameDataFetchSuccessAction.typeId;
  constructor(public payload: string) {
  }
}
export class GameDataFetchFailAction implements Action {
  static typeId: 'GAME_DATA_FETCH_FAIL' = type('GAME_DATA_FETCH_FAIL');
  type = GameDataFetchFailAction.typeId;
  constructor(public payload: string) {
  }
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

export type GameDataActionClasses
  = GameDataAddSheetAction
  | GameDataRemoveSheetAction
  | GameDataFetchAction
  | GameDataFetchSuccessAction
  | GameDataFetchFailAction;

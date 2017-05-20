import {Action} from '@ngrx/store';
import {type} from '../util';
import {SpriteDataMap} from './sprites.model';

export class SpritesRegisterAction implements Action {
  static typeId: 'SPRITE_REGISTER_MAP' = type('SPRITE_REGISTER_MAP');
  type = SpritesRegisterAction.typeId;

  constructor(public payload: SpriteDataMap) {
  }
}

export class SpritesLoadAction implements Action {
  static typeId: 'SPRITES_LOAD' = type('SPRITES_LOAD');
  type = SpritesLoadAction.typeId;

  payload: string;

  constructor(indexMetadataUrl: string) {
    this.payload = indexMetadataUrl;
  }
}

export class SpritesLoadSuccessAction implements Action {
  static typeId: 'SPRITES_LOAD_SUCCESS' = type('SPRITES_LOAD_SUCCESS');
  type = SpritesLoadSuccessAction.typeId;
  payload: string;
  constructor(indexMetadataUrl: string) {
    this.payload = indexMetadataUrl;
  }
}

export class SpritesLoadFailAction implements Action {
  static typeId: 'SPRITES_LOAD_FAIL' = type('SPRITES_LOAD_FAIL');
  type = SpritesLoadFailAction.typeId;
  payload: string;
  constructor(indexMetadataUrl: string) {
    this.payload = indexMetadataUrl;
  }
}

export type SpriteActions
  = SpritesRegisterAction
  | SpritesLoadAction
  | SpritesLoadSuccessAction
  | SpritesLoadFailAction;

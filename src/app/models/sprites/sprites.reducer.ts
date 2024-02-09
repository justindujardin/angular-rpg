import * as Immutable from 'immutable';
import { TypedRecord } from 'typed-immutable-record';
import { registerSprites } from '../../core/api';
import { exhaustiveCheck, makeRecordFactory } from '../util';
import {
  SpriteActions,
  SpritesLoadAction,
  SpritesLoadFailAction,
  SpritesLoadSuccessAction,
  SpritesRegisterAction,
} from './sprites.actions';
import { SpriteData, SpriteState } from './sprites.model';

interface SpritesStateRecord extends TypedRecord<SpritesStateRecord>, SpriteState {}

/**
 * @internal
 */
export const spritesStateFactory = makeRecordFactory<SpriteState, SpritesStateRecord>({
  loaded: false,
  spritesById: Immutable.Map<string, SpriteData>(),
});

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function spritesFromJSON(object: SpriteState): SpriteState {
  const recordValues = {
    spritesById: Immutable.Map<string, SpriteData>(object.spritesById),
    loaded: object.loaded,
  };
  registerSprites('', object.spritesById);
  return spritesStateFactory(recordValues);
}

export function spritesReducer(
  state: SpritesStateRecord = spritesStateFactory(),
  action: SpriteActions,
): SpritesStateRecord {
  switch (action.type) {
    case SpritesRegisterAction.typeId: {
      return state.updateIn(['spritesById'], (s) => s.merge(action.payload));
    }
    case SpritesLoadSuccessAction.typeId: {
      return state.merge({
        loaded: true,
      });
    }
    // These only have side-effects
    case SpritesLoadFailAction.typeId:
    case SpritesLoadAction.typeId:
      return state;
    default:
      exhaustiveCheck(action);
      return state;
  }
}

/** @internal {@see sliceSpritesState} */
export const sliceSpritesLoaded = (state: SpritesStateRecord) => state.loaded;
/** @internal {@see sliceSpritesState} */
export const sliceSpritesById = (state: SpritesStateRecord) => state.spritesById;

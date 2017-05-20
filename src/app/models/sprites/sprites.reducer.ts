import * as Immutable from 'immutable';
import {assertTrue, exhaustiveCheck, makeRecordFactory} from '../util';
import {TypedRecord} from 'typed-immutable-record';
import {SpriteData, SpriteState} from './sprites.model';
import {
  SpriteActions, SpritesLoadAction, SpritesLoadFailAction, SpritesLoadSuccessAction,
  SpritesRegisterAction
} from './sprites.actions';
import {registerSprites} from '../../../game/pow2/core/api';

interface SpritesStateRecord extends TypedRecord<SpritesStateRecord>, SpriteState {
}

/**
 * @internal
 */
export const spritesStateFactory = makeRecordFactory<SpriteState, SpritesStateRecord>({
  loaded: false,
  spritesById: Immutable.Map<string, SpriteData>()
});

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function spritesFromJSON(object: SpriteState): SpriteState {
  const recordValues = {
    spritesById: Immutable.Map<string, SpriteData>(object.spritesById),
    loaded: object.loaded
  };
  registerSprites('', object.spritesById);
  return spritesStateFactory(recordValues);
}

export function spritesReducer(state: SpritesStateRecord = spritesStateFactory(),
                               action: SpriteActions): SpritesStateRecord {
  switch (action.type) {
    case SpritesRegisterAction.typeId: {
      const map = Immutable.Map<string, SpriteData>(action.payload);
      map.forEach((value, key) => {
        assertTrue(!state.spritesById.has(key), `duplicates are not allowed. sprite (${key}) is already declared`);
      });
      return state.updateIn(['spritesById'], (s) => s.merge(action.payload));
    }
    case SpritesLoadSuccessAction.typeId: {
      return state.merge({
        loaded: true
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

import * as Immutable from 'immutable';
import { SpritesRegisterAction } from './sprites.actions';
import { SpriteData } from './sprites.model';
import { spritesReducer, spritesStateFactory } from './sprites.reducer';

describe('Sprites', () => {
  describe('Actions', () => {
    describe('SpritesRegisterMapAction', () => {
      it('should insert each sprite by its filename into the sprite map', () => {
        const sprites = Immutable.Map<string, SpriteData>({
          'test.png': {
            height: 20,
          },
          'another.png': {
            width: 10,
          },
        });
        const state = spritesStateFactory();
        const actual = spritesReducer(state, new SpritesRegisterAction(sprites));
        expect(actual.spritesById.get('test.png').height).toBe(20);
        expect(actual.spritesById.get('another.png').width).toBe(10);
      });
    });
  });
});

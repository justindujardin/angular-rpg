import {spritesReducer, spritesStateFactory} from './sprites.reducer';
import {SpritesRegisterAction} from './sprites.actions';
import * as Immutable from 'immutable';
import {SpriteData} from './sprites.model';

describe('Sprites', () => {
  describe('Actions', () => {
    describe('SpritesRegisterMapAction', () => {
      it('should throw if registering sprites with duplicate ids', () => {
        expect(() => {
          const sprites = Immutable.Map<string, SpriteData>({
            'test.png': {}
          });
          // start with test.png in the sprites
          const state = spritesStateFactory({
            spritesById: sprites
          });
          // Second insert will throw
          spritesReducer(state, new SpritesRegisterAction(sprites));
        }).toThrow();
      });
      it('should insert each sprite by its filename into the sprite map', () => {
        const sprites = Immutable.Map<string, SpriteData>({
          'test.png': {
            height: 20
          },
          'another.png': {
            width: 10
          }
        });
        const state = spritesStateFactory();
        const actual = spritesReducer(state, new SpritesRegisterAction(sprites));
        expect(actual.spritesById.get('test.png').height).toBe(20);
        expect(actual.spritesById.get('another.png').width).toBe(10);
      });
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { APP_TESTING_PROVIDERS } from '../../../app.testing';
import { AudioResource, ResourceManager } from '../../../core';
import { getSoundEffectUrl } from '../../../core/api';
import { assertTrue } from '../../../models/util';
import { GameWorld } from '../../../services/game-world';
import { CombatActionBehavior } from './combat-action.behavior';

describe('CombatActionBehavior', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      providers: APP_TESTING_PROVIDERS,
    }).compileComponents();
  });
  describe('act', () => {
    it('rejects in base class', async () => {
      const loader = TestBed.inject(ResourceManager);
      const gameWorld = TestBed.inject(GameWorld);
      const behavior = new CombatActionBehavior(loader, gameWorld);
      await expectAsync(behavior.act()).toBeRejected();
    });
  });

  describe('preload', () => {
    it('async loads specified sounds on the class', async () => {
      const loader = TestBed.inject(ResourceManager);
      const gameWorld = TestBed.inject(GameWorld);
      const behavior = new CombatActionBehavior(loader, gameWorld);
      behavior.sounds = {
        test: getSoundEffectUrl('hit'),
      };
      const resources = await behavior.preload();
      expect(resources.length).toBe(1);
      const sound = resources[0] as AudioResource;
      expect(sound.url).toBe(behavior.sounds.test);
    });
    it('async loads specified sprites on the class', async () => {
      const loader = TestBed.inject(ResourceManager);
      const gameWorld = TestBed.inject(GameWorld);
      const behavior = new CombatActionBehavior(loader, gameWorld);
      behavior.sprites = { test: 'club.png' };
      const resources = await behavior.preload();
      expect(resources.length).toBe(1);

      const meta = gameWorld.sprites.getSpriteMeta('club.png');
      assertTrue(meta, 'invalid sprite: club.png');
      const expectedUrl = `assets/images/${meta.source}.png`;
      expect(resources[0].url).toBe(expectedUrl);
    });
  });
});

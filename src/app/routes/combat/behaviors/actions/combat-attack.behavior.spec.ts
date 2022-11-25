import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../../app.imports';
import {
  APP_TESTING_PROVIDERS,
  testAppLoadSprites,
  testAppMockNotificationService,
} from '../../../../app.testing';
import { GameEntityObject } from '../../../../scene/objects/game-entity-object';
import { GameWorld } from '../../../../services/game-world';
import { RPGGame } from '../../../../services/rpg-game';
import { testCombatCreateComponent } from '../../combat.testing';
import { CombatAttackBehaviorComponent } from './combat-attack.behavior';

describe('CombatAttackBehaviorComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      providers: [...APP_TESTING_PROVIDERS, testAppMockNotificationService()],
    }).compileComponents();
    await testAppLoadSprites();
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
    world = TestBed.inject(GameWorld);
    world.time.start();
  });
  afterEach(() => {
    world.time.stop();
  });
  describe('act', () => {
    it('rejects with invalid to/from', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      comp.to = null;
      comp.from = null;
      await expectAsync(comp.act()).toBeRejected();
    });
    it('rejects if to/from have invalid model properties', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      comp.to = new GameEntityObject();
      comp.from = new GameEntityObject();
      await expectAsync(comp.act()).toBeRejected();
    });
    it('resolves with valid to/from', async () => {
      const combat = testCombatCreateComponent(null);
      const party = combat.party.toArray();
      const enemies = combat.enemies.toArray();
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      comp.combat = combat;
      comp.from = party[0];
      comp.to = enemies[0];
      fixture.detectChanges();

      const result = await comp.act();
      expect(result).toBe(true);
    });
  });
});

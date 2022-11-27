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

  describe('getHitSound', async () => {
    it('returns kill sound when damage reduces target HP to 0', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getHitSound(10, 12)).toBe(comp.sounds.killSound);
    });
    it('returns miss sound when damage is 0', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getHitSound(10, 0)).toBe(comp.sounds.missSound);
    });
    it('returns hit sound when damage is > 0 and target is not guarding', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getHitSound(10, 2, false)).toBe(comp.sounds.hitSound);
    });
    it('returns miss sound when damage is > 0 and target is guarding', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getHitSound(10, 2, true)).toBe(comp.sounds.missSound);
    });
  });
  describe('getDamageAnimation', async () => {
    it('returns hit animation when damage > 0 for a single attack', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getDamageAnimation(10, 1)).toBe(comp.sprites.hit);
    });
    it('returns doubleHit animation when damage > 0 for multiple attacks', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getDamageAnimation(10, 2)).toBe(comp.sprites.doubleHit);
    });
    it('returns guardHit animation when damage > 0 and target is guarding', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getDamageAnimation(10, 1, true)).toBe(comp.sprites.guardHit);
    });
    it('returns missHit animation when damage = 0', async () => {
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      expect(comp.getDamageAnimation(0)).toBe(comp.sprites.missHit);
    });
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
    it('resolves with valid to/from (party)', async () => {
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
    it('resolves with valid to/from (enemy)', async () => {
      const combat = testCombatCreateComponent(null);
      const party = combat.party.toArray();
      const enemies = combat.enemies.toArray();
      const fixture = TestBed.createComponent(CombatAttackBehaviorComponent);
      const comp = fixture.componentInstance;
      comp.combat = combat;
      comp.from = enemies[0];
      comp.to = party[0];
      fixture.detectChanges();

      const result = await comp.act();
      expect(result).toBe(true);
    });
  });
});

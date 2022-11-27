import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../../app.imports';
import {
  APP_TESTING_PROVIDERS,
  testAppAddToInventory,
  testAppGetInventory,
  testAppLoadSprites,
  testAppMockNotificationService,
} from '../../../../app.testing';
import { MAGIC_DATA } from '../../../../models/game-data/magic';
import { Magic } from '../../../../models/item';
import { assertTrue } from '../../../../models/util';
import { GameEntityObject } from '../../../../scene/objects/game-entity-object';
import { GameWorld } from '../../../../services/game-world';
import { RPGGame } from '../../../../services/rpg-game';
import {
  testCombatCreateComponent,
  testCombatCreateComponentFixture,
  testCombatGetEnemies,
} from '../../combat.testing';
import { CombatMagicBehavior } from './combat-magic.behavior';

describe('CombatMagicBehavior', () => {
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

  describe('canBeUsedBy', async () => {
    it('returns false for entities without a valid model', async () => {
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const comp = fixture.componentInstance;
      const entity = new GameEntityObject();
      await expect(comp.canBeUsedBy(entity)).toBe(false);
    });
    it('returns false for non-magic classes', async () => {
      const combat = testCombatCreateComponent(null);
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const comp = fixture.componentInstance;
      comp.combat = combat;
      const party = combat.party.toArray();
      const entity = party.find((p) => p.model.type === 'warrior');
      assertTrue(entity, 'unable to find warrior');
      await expect(comp.canBeUsedBy(entity)).toBe(false);
    });
    it('returns false for magic classes with no spells', async () => {
      const combat = testCombatCreateComponent(null);
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const comp = fixture.componentInstance;
      comp.combat = combat;
      const party = combat.party.toArray();
      const entity = party.find((p) => p.model.type === 'healer');
      assertTrue(entity, 'unable to find healer');
      await expect(comp.canBeUsedBy(entity)).toBe(false);
    });
    it('returns true for magic classes with available spells', async () => {
      const combat = testCombatCreateComponent(null);
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      testAppAddToInventory(world.store, 'heal', MAGIC_DATA);
      const comp = fixture.componentInstance;
      comp.combat = combat;
      const party = combat.party.toArray();
      const entity = party.find((p) => p.model.type === 'healer');
      assertTrue(entity, 'unable to find healer');
      await expect(comp.canBeUsedBy(entity)).toBe(true);
    });
  });

  describe('act', () => {
    beforeEach(async () => {
      testAppAddToInventory(world.store, 'heal', MAGIC_DATA);
      testAppAddToInventory(world.store, 'push', MAGIC_DATA);
    });
    it('rejects with invalid spell', async () => {
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const comp = fixture.componentInstance;
      comp.spell = null;
      await expectAsync(comp.act()).toBeRejected();
    });
    it('rejects with valid spell and invalid from caster/target', async () => {
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const inventory = testAppGetInventory(world.store);
      const spell = inventory.find((i) => i.id === 'heal') as Magic;
      assertTrue(spell, 'could not find heal spell in inventory');
      const comp = fixture.componentInstance;
      comp.spell = spell;
      comp.from = null;
      comp.to = null;
      await expectAsync(comp.act()).toBeRejected();
    });
    it('resolves with valid heal spell and caster/target', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const inventory = testAppGetInventory(world.store);
      const spell = inventory.find((i) => i.id === 'heal') as Magic;
      assertTrue(spell, 'could not find heal spell in inventory');
      const party = combat.party.toArray();
      const enemies = combat.enemies.toArray();
      const comp = fixture.componentInstance;
      const caster = party.find((p) => p.model.type === 'healer');
      assertTrue(caster, 'unable to find healer');
      comp.combat = combat;
      comp.from = caster;
      comp.to = enemies[0];
      comp.spell = spell;
      await expectAsync(comp.act()).toBeResolved();
    });
    it('resolves with valid push spell and caster/target', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const inventory = testAppGetInventory(world.store);
      const spell = inventory.find((i) => i.id === 'push') as Magic;
      assertTrue(spell, 'could not find push spell in inventory');
      const party = combat.party.toArray();
      const enemies = combat.enemies.toArray();
      const comp = fixture.componentInstance;
      const caster = party.find((p) => p.model.type === 'healer');
      assertTrue(caster, 'unable to find healer');
      comp.combat = combat;
      comp.from = caster;
      comp.to = enemies[0];
      comp.spell = spell;
      await expectAsync(comp.act()).toBeResolved();
    });
    it('resolves with valid push spell that kills a target', async () => {
      const { combat } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatMagicBehavior);
      const inventory = testAppGetInventory(world.store);
      const spell = inventory.find((i) => i.id === 'push') as Magic;
      assertTrue(spell, 'could not find push spell in inventory');
      const party = combat.party.toArray();
      let enemies = combat.enemies.toArray();
      const comp = fixture.componentInstance;

      const caster = party.find((p) => p.model.type === 'healer');
      assertTrue(caster, 'unable to find healer');
      const target = combat.enemies.toArray()[0];

      comp.combat = combat;
      comp.from = caster;
      comp.to = target;
      comp.spell = spell;
      await expectAsync(comp.act()).toBeResolved();

      const outEnemy = testCombatGetEnemies(comp.store)[0];
      expect(outEnemy.hp).toBe(0);
    });
  });
});

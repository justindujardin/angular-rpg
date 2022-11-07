import { QueryList } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { testAppAddToInventory } from '../../../app.testing';
import { IEnemy } from '../../../models/base-entity';
import { ARMOR_DATA } from '../../../models/game-data/armors';
import { ITEMS_DATA } from '../../../models/game-data/items';
import { MAGIC_DATA } from '../../../models/game-data/magic';
import { WEAPONS_DATA } from '../../../models/game-data/weapons';
import { Scene } from '../../../scene/scene';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { CombatEnemyComponent } from '../combat-enemy.component';
import {
  testCombatAddEnemyCombatants,
  testCombatAddPartyCombatants,
} from '../combat.testing';
import { CombatStateMachineComponent } from './combat.machine';

function getFixture() {
  const fixture = TestBed.createComponent(CombatStateMachineComponent);
  const comp: CombatStateMachineComponent = fixture.componentInstance;
  comp.scene = new Scene();
  fixture.detectChanges();
  return { fixture, comp };
}

describe('CombatStateMachineComponent', () => {
  let world: GameWorld;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatStateMachineComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('initializes with defaultState', async () => {
    const { fixture, comp } = getFixture();
    await fixture.whenRenderingDone();
    expect(comp.getCurrentName()).toBe(comp.defaultState);
  });
  it('exposes weapons/armor/items/spells from inventory', async () => {
    const { fixture, comp } = getFixture();
    testAppAddToInventory(world.store, 'short-sword', WEAPONS_DATA);
    testAppAddToInventory(world.store, 'leather-armor', ARMOR_DATA);
    testAppAddToInventory(world.store, 'push', MAGIC_DATA);
    testAppAddToInventory(world.store, 'heal', MAGIC_DATA);
    testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
    testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
    testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
    fixture.detectChanges();
    expect(comp.weapons.size).toBe(1);
    expect(comp.spells.size).toBe(2);
    expect(comp.armors.size).toBe(1);
    expect(comp.items.size).toBe(3);
  });
  describe('isFriendlyTurn', () => {
    it('returns false if there is no current player/party', async () => {
      const { fixture, comp } = getFixture();
      comp.current = null;
      comp.enemies = new QueryList<CombatEnemyComponent>();
      comp.party = null;
      fixture.detectChanges();
      expect(comp.isFriendlyTurn()).toBe(false);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, comp } = getFixture();

      const players = testCombatAddPartyCombatants(world.store, comp);
      comp.current = players[0];
      fixture.detectChanges();
      expect(comp.isFriendlyTurn()).toBe(true);
    });
  });
  describe('getLiveParty', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      comp.party = null;
      fixture.detectChanges();
      expect(comp.getLiveParty().length).toBe(0);
    });
    it('returns array of party members with hp > 0', async () => {
      const { fixture, comp } = getFixture();

      const players = testCombatAddPartyCombatants(world.store, comp);
      fixture.detectChanges();
      expect(comp.getLiveParty().length).toEqual(3);

      // Excludes 0 hp members
      players[0].model = { ...players[0].model, hp: 0 };
      expect(comp.getLiveParty().length).toEqual(2);
    });
  });
  describe('getLiveEnemies', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      comp.enemies = null;
      fixture.detectChanges();
      expect(comp.getLiveEnemies().length).toBe(0);
    });
    it('returns array of party members with hp > 0', async () => {
      const { fixture, comp } = getFixture();

      const objects = await testCombatAddEnemyCombatants(comp);
      fixture.detectChanges();
      expect(comp.getLiveEnemies().length).toEqual(3);

      // Excludes 0 hp members
      const enemyModel = objects[0].model as IEnemy;
      objects[0].model = { ...enemyModel, hp: 0 };
      expect(comp.getLiveEnemies().length).toEqual(2);
    });
  });
  describe('getRandomPartyMember', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      fixture.detectChanges();
      comp.party = null;
      expect(comp.getRandomPartyMember()).toBe(null);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, comp } = getFixture();

      const players = testCombatAddPartyCombatants(world.store, comp);
      fixture.detectChanges();
      expect(comp.getRandomPartyMember()).not.toBeNull();
      // Excludes null/undefined items in party
      comp.party?.reset([undefined as any]);
      expect(comp.getRandomPartyMember()).toBeNull();

      // Returns nothing with all defeated models
      players.forEach((p) => {
        p.model = { ...p.model, hp: 0 };
      });
      comp.party?.reset(players);
      expect(comp.getRandomPartyMember()).toBeNull();
    });
  });
  describe('getRandomEnemy', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      fixture.detectChanges();
      comp.enemies = null;
      expect(comp.getRandomEnemy()).toBe(null);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, comp } = getFixture();

      const enemies = await testCombatAddEnemyCombatants(comp);
      fixture.detectChanges();
      expect(comp.getRandomEnemy()).not.toBeNull();
      // Excludes null/undefined items in party
      comp.enemies?.reset([undefined as any]);
      expect(comp.getRandomEnemy()).toBeNull();

      // Returns nothing with all defeated models
      enemies.forEach((p) => {
        p.model = { ...p.model, hp: 0 } as IEnemy;
      });
      comp.enemies?.reset(enemies);
      expect(comp.getRandomEnemy()).toBeNull();
    });
  });
});

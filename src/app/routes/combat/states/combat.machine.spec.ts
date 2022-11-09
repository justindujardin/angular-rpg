import { QueryList } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { testAppAddToInventory } from '../../../app.testing';
import { IEnemy } from '../../../models/base-entity';
import { CombatAttackAction } from '../../../models/combat/combat.actions';
import { ARMOR_DATA } from '../../../models/game-data/armors';
import { ITEMS_DATA } from '../../../models/game-data/items';
import { MAGIC_DATA } from '../../../models/game-data/magic';
import { RANDOM_ENCOUNTERS_DATA } from '../../../models/game-data/random-encounters';
import { WEAPONS_DATA } from '../../../models/game-data/weapons';
import { assertTrue } from '../../../models/util';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { CombatEnemyComponent } from '../combat-enemy.component';
import {
  testCombatAddEnemyCombatants,
  testCombatAddPartyCombatants,
  testCombatCreateComponentFixture,
} from '../combat.testing';
import { CombatStateMachineComponent } from './combat.machine';

describe('CombatStateMachineComponent', () => {
  let world: GameWorld;
  const encounter = RANDOM_ENCOUNTERS_DATA[0];

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
    const { fixture, combat } = testCombatCreateComponentFixture();
    await fixture.whenRenderingDone();
    expect(combat.machine.getCurrentName()).toBe(combat.defaultState);
  });
  it('exposes weapons/armor/items/spells from inventory', async () => {
    const { fixture, machine } = testCombatCreateComponentFixture();
    testAppAddToInventory(world.store, 'short-sword', WEAPONS_DATA);
    testAppAddToInventory(world.store, 'leather-armor', ARMOR_DATA);
    testAppAddToInventory(world.store, 'push', MAGIC_DATA);
    testAppAddToInventory(world.store, 'heal', MAGIC_DATA);
    testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
    testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
    testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
    fixture.detectChanges();
    expect(machine.weapons.size).toBe(1);
    expect(machine.spells.size).toBe(2);
    expect(machine.armors.size).toBe(1);
    expect(machine.items.size).toBe(3);
  });
  describe('isFriendlyTurn', () => {
    it('returns false if there is no current player/party', async () => {
      const { fixture, machine } = testCombatCreateComponentFixture();
      machine.current = null;
      machine.enemies = new QueryList<CombatEnemyComponent>();
      machine.party = null;
      fixture.detectChanges();
      expect(machine.isFriendlyTurn()).toBe(false);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();
      const players = combat.party.toArray();
      machine.current = players[0];
      fixture.detectChanges();
      expect(machine.isFriendlyTurn()).toBe(true);
    });
  });
  describe('getLiveParty', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();

      machine.party = null;
      fixture.detectChanges();
      expect(machine.getLiveParty().length).toBe(0);
    });
    it('returns array of party members with hp > 0', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();
      const player = combat.party.toArray()[0];
      const enemy = combat.enemies.toArray()[0];
      assertTrue(player?.model, 'invalid player model');
      assertTrue(enemy?.model, 'invalid enemy model');
      fixture.detectChanges();
      expect(machine.getLiveParty().length).toEqual(combat.party.length);

      // Excludes defeated enemies
      combat.store.dispatch(
        new CombatAttackAction({
          damage: 1000,
          attacker: enemy.model,
          defender: player.model,
        })
      );
      fixture.detectChanges();
      expect(machine.getLiveParty().length).toEqual(combat.party.length - 1);
    });
  });
  describe('getLiveEnemies', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();
      machine.enemies = null;
      fixture.detectChanges();
      expect(machine.getLiveEnemies().length).toBe(0);
    });
    it('returns array of enemies with hp > 0', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();
      const player = combat.party.toArray()[0];
      const enemy = combat.enemies.toArray()[0];
      assertTrue(player?.model, 'invalid player model');
      assertTrue(enemy?.model, 'invalid enemy model');
      fixture.detectChanges();
      expect(machine.getLiveEnemies().length).toEqual(encounter.enemies.length);

      // Excludes defeated enemies
      combat.store.dispatch(
        new CombatAttackAction({
          damage: 1000,
          attacker: player.model,
          defender: enemy.model,
        })
      );
      fixture.detectChanges();
      expect(machine.getLiveEnemies().length).toEqual(encounter.enemies.length - 1);
    });
  });
  describe('getRandomPartyMember', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();

      fixture.detectChanges();
      machine.party = null;
      expect(machine.getRandomPartyMember()).toBe(null);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();
      const players = testCombatAddPartyCombatants(world.store, combat);
      fixture.detectChanges();
      expect(machine.getRandomPartyMember()).not.toBeNull();
      // Excludes null/undefined items in party
      machine.party?.reset([undefined as any]);
      expect(machine.getRandomPartyMember()).toBeNull();

      // Returns nothing with all defeated models
      players.forEach((p) => {
        p.model = { ...p.model, hp: 0 };
      });
      machine.party?.reset(players);
      expect(machine.getRandomPartyMember()).toBeNull();
    });
  });
  describe('getRandomEnemy', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();

      fixture.detectChanges();
      machine.enemies = null;
      expect(machine.getRandomEnemy()).toBe(null);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, combat, machine } = testCombatCreateComponentFixture();
      const enemies = testCombatAddEnemyCombatants(combat);
      fixture.detectChanges();
      expect(machine.getRandomEnemy()).not.toBeNull();
      // Excludes null/undefined items in party
      machine.enemies?.reset([undefined as any]);
      expect(machine.getRandomEnemy()).toBeNull();

      // Returns nothing with all defeated models
      enemies.forEach((p) => {
        p.model = { ...p.model, hp: 0 } as IEnemy;
      });
      machine.enemies?.reset(enemies);
      expect(machine.getRandomEnemy()).toBeNull();
    });
  });
});

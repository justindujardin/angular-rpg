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
import { CombatAttackAction } from '../../../../models/combat/combat.actions';
import { CombatAttack } from '../../../../models/combat/combat.model';
import { ITEMS_DATA } from '../../../../models/game-data/items';
import { GameWorld } from '../../../../services/game-world';
import { RPGGame } from '../../../../services/rpg-game';
import {
  testCombatCreateComponentFixture,
  testCombatGetParty,
} from '../../combat.testing';
import { CombatItemBehavior } from './combat-item.behavior';

describe('CombatItemBehavior', () => {
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
    testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
  });
  afterEach(() => {
    world.time.stop();
  });
  it('requires a target', async () => {
    const { combat } = testCombatCreateComponentFixture();
    const fixture = TestBed.createComponent(CombatItemBehavior);
    const comp = fixture.componentInstance;
    comp.combat = combat;
    expect(comp.canTarget()).toBe(true);
  });
  describe('act', () => {
    it('rejects if not used by a player entity', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatItemBehavior);
      const comp = fixture.componentInstance;
      spyOn(machine, 'setCurrentState');
      comp.combat = combat;
      comp.from = null;
      await expectAsync(comp.act()).toBeRejected();
    });
    it('transitions to end-turn state', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatItemBehavior);
      const comp = fixture.componentInstance;
      const players = combat.party.toArray();
      spyOn(machine, 'setCurrentState');
      const inventory = testAppGetInventory(world.store);
      comp.item = inventory[0];
      comp.combat = combat;
      comp.from = players[0];
      comp.to = players[0];
      await expectAsync(comp.act()).toBeResolved();
      expect(machine.setCurrentState).toHaveBeenCalledOnceWith('end-turn');
    });
    it('applies item effects to target', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatItemBehavior);
      const comp = fixture.componentInstance;
      const players = combat.party.toArray();

      const inventory = testAppGetInventory(world.store);
      comp.item = inventory[0];
      comp.combat = combat;
      comp.from = players[0];
      comp.to = players[0];

      // Damage player
      const healData: CombatAttack = {
        attacker: players[0].model,
        defender: players[0].model,
        damage: 25,
      };
      comp.store.dispatch(new CombatAttackAction(healData));
      let combatParty = testCombatGetParty(comp.store);
      expect(combatParty[0].hp).toBe(combatParty[0].maxhp - 25);

      // Use item
      await expectAsync(comp.act()).toBeResolved();

      // Potion healed player to maxhp
      combatParty = testCombatGetParty(comp.store);
      expect(combatParty[0].hp).toBe(combatParty[0].maxhp);
    });
  });
});

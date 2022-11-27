import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { testAppAddToInventory } from '../../../app.testing';
import { ITEMS_DATA } from '../../../models/game-data/items';
import { MAGIC_DATA } from '../../../models/game-data/magic';
import { Item } from '../../../models/item';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { CombatPlayerComponent } from '../combat-player.component';
import { testCombatCreateComponentFixture } from '../combat.testing';
import { CombatChooseActionStateComponent } from '../states';
import {
  ChooseActionStateMachine,
  ChooseActionSubmit,
  ChooseActionTarget,
  ChooseMagicSpell,
  ChooseUsableItem,
} from './choose-action.machine';
import { CombatActionBehavior } from './combat-action.behavior';

function getMachine() {
  const { combat } = testCombatCreateComponentFixture();
  const fixture = TestBed.createComponent(CombatChooseActionStateComponent);
  const choose = fixture.componentInstance;
  choose.machine = combat.machine;
  let actionCalled: CombatActionBehavior | undefined;
  const selectedAction = (): CombatActionBehavior | undefined => {
    return actionCalled;
  };
  const machine = new ChooseActionStateMachine(
    choose,
    combat.scene,
    combat.party.toArray(),
    combat.enemies.toArray(),
    (a) => {
      actionCalled = a;
    }
  );
  return { machine, combat, fixture, selectedAction };
}

describe('ChooseActionStateMachine', () => {
  let world: GameWorld;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
    world.time.start();
  });
  afterEach(() => {
    world.time.stop();
  });

  it('initializes with no selected action', async () => {
    const { machine, selectedAction } = getMachine();
    expect(machine.getCurrentName()).toBe(machine.defaultState);
    expect(selectedAction()).toBeUndefined();
  });

  describe('ChooseActionType', async () => {
    it('clicking on an enemy to attack transitions to choose-target state', async () => {
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'ranger') as GameEntityObject;
      await machine.setCurrentState('choose-action');

      const enemy = combat.enemies.get(0);
      assertTrue(enemy, 'could not find enemy to click on');
      combat.machine.onClick$.next({ hits: [enemy] } as any);

      expect(machine.getCurrentName()).toBe(ChooseActionTarget.NAME);
    });
    it('choosing attack transitions to choose-target state', async () => {
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'ranger') as GameEntityObject;
      await machine.setCurrentState('choose-action');

      const item = machine.parent.items.find((i) => i.label === 'attack');
      assertTrue(item, 'could not find action for selection');
      item.select();

      expect(machine.getCurrentName()).toBe(ChooseActionTarget.NAME);
    });
    it('choosing guard transitions to choose-submit state', async () => {
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'healer') as GameEntityObject;
      await machine.setCurrentState('choose-action');

      const item = machine.parent.items.find((i) => i.label === 'guard');
      assertTrue(item, 'could not find action for selection');
      item.select();

      expect(machine.getCurrentName()).toBe(ChooseActionSubmit.NAME);
    });
    it('choosing item transitions to choose-item state', async () => {
      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'warrior') as GameEntityObject;

      await machine.setCurrentState('choose-action');

      const item = machine.parent.items.find((i) => i.label === 'item');
      assertTrue(item, 'could not find action for selection');
      item.select();

      expect(machine.getCurrentName()).toBe(ChooseUsableItem.NAME);
    });
    it('choosing magic transitions to choose-magic state', async () => {
      testAppAddToInventory(world.store, 'heal', MAGIC_DATA);

      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'healer') as GameEntityObject;

      await machine.setCurrentState('choose-action');

      const item = machine.parent.items.find((i) => i.label === 'magic');
      assertTrue(item, 'could not find action for selection');
      item.select();

      expect(machine.getCurrentName()).toBe(ChooseMagicSpell.NAME);
    });
  });
  describe('ChooseActionTarget', async () => {
    it('clicking on an enemy to targets them', async () => {
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'ranger') as GameEntityObject;
      await machine.setCurrentState(ChooseActionTarget.NAME);

      const enemy = combat.enemies.get(0);
      assertTrue(enemy, 'could not find enemy to click on');
      combat.machine.onClick$.next({ hits: [enemy] } as any);

      expect(machine.getCurrentName()).toBe(ChooseActionTarget.NAME);
    });
    it('clicking on an enemy twice transitions to choose-submit', async () => {
      const { combat, machine, fixture } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'ranger') as GameEntityObject;
      await machine.setCurrentState(ChooseActionTarget.NAME);

      machine.action = machine.current
        .findBehaviors(CombatActionBehavior)
        .find((c: CombatActionBehavior) => c.name === 'attack') as CombatActionBehavior;

      const enemy = combat.enemies.get(0);
      assertTrue(enemy, 'could not find enemy to click on');
      combat.machine.onClick$.next({ hits: [enemy] } as any);
      fixture.detectChanges();
      combat.machine.onClick$.next({ hits: [enemy] } as any);

      expect(machine.getCurrentName()).toBe(ChooseActionSubmit.NAME);
    });
    it('targets party by default when using items', async () => {
      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'ranger') as GameEntityObject;
      machine.item = combat.machine.items.get(0) as Item;
      await machine.setCurrentState(ChooseActionTarget.NAME);

      // The combat menu items point to CombatPlayerComponents
      expect(machine.parent.items.length).toBe(combat.party.length);
      machine.parent.items.forEach((i) => {
        expect(i.source instanceof CombatPlayerComponent).toBe(true);
      });
    });
  });

  describe('ChooseActionSubmit', async () => {
    it('calls selected action function', async () => {
      const { combat, machine, selectedAction } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'ranger') as GameEntityObject;
      machine.target = combat.enemies.toArray()[0];
      machine.action = machine.current
        .findBehaviors(CombatActionBehavior)
        .find((c: CombatActionBehavior) => c.name === 'attack') as CombatActionBehavior;

      await machine.setCurrentState(ChooseActionSubmit.NAME);
      expect(selectedAction()).toEqual(machine.action);
    });
  });

  describe('ChooseMagicSpell', async () => {
    it('transitions to choose-target after selecting a spell', async () => {
      testAppAddToInventory(world.store, 'heal', MAGIC_DATA);
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'healer') as GameEntityObject;
      await machine.setCurrentState(ChooseMagicSpell.NAME);
      expect(machine.target).toBeNull();

      const item = machine.parent.items[0];
      assertTrue(item, 'could not find action for selection');
      item.select();

      expect(machine.getCurrentName()).toBe(ChooseActionTarget.NAME);
    });
  });

  describe('ChooseUsableItem', async () => {
    it('transitions to choose-target after selecting an item', async () => {
      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'healer') as GameEntityObject;
      await machine.setCurrentState(ChooseUsableItem.NAME);
      expect(machine.target).toBeNull();

      const item = machine.parent.items[0];
      assertTrue(item, 'could not find action for selection');
      item.select();

      expect(machine.getCurrentName()).toBe(ChooseActionTarget.NAME);
    });
    it('excludes items that have already been selected by another player', async () => {
      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
      const { combat, machine } = getMachine();
      machine.current = combat.party
        .toArray()
        .find((p) => p.model.type === 'healer') as GameEntityObject;

      const state = machine.getState('choose-item') as ChooseUsableItem;
      state.selectedItems.push(combat.machine.items.get(0));
      await machine.setCurrentState(ChooseUsableItem.NAME);
      expect(machine.target).toBeNull();
      expect(machine.parent.items.length).toBe(1);
    });
  });
});

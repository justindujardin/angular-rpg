import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import {
  testAppAddToInventory,
  testAppGetInventory,
  testAppGetPartyGold,
  testAppGetPartyWithEquipment,
} from '../../../app.testing';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { EntityAddItemAction } from '../../../models/entity/entity.actions';
import { instantiateEntity } from '../../../models/game-data/game-data.model';
import { ITEMS_DATA } from '../../../models/game-data/items';
import { WEAPONS_DATA } from '../../../models/game-data/weapons';
import {
  GameStateAddInventoryAction,
  GameStateEquipItemAction,
  GameStateUnequipItemAction,
} from '../../../models/game-state/game-state.actions';
import { Item, Weapon } from '../../../models/item';
import { SpritesService } from '../../../models/sprites/sprites.service';
import { assertTrue } from '../../../models/util';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import {
  IStoreFeatureProperties,
  StoreFeatureComponent,
} from './store-feature.component';

function getFeature(
  values: Partial<ITiledObject<IStoreFeatureProperties>> = {},
  properties: Partial<IStoreFeatureProperties> = {}
): ITiledObject<IStoreFeatureProperties> {
  return {
    name: 'feature',
    class: 'StoreFeatureComponent',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    visible: true,
    properties: {
      inventory: 'club',
      ...properties,
    },
    ...values,
  };
}

function getStoreSelection(obs: Observable<any>): Item[] {
  let result = new Set<Item>();
  obs.pipe(take(1)).subscribe((s) => (result = s));
  return [...result];
}

describe('StoreFeatureComponent', () => {
  let world: GameWorld;
  const tileObject: any = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [StoreFeatureComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const sprites = TestBed.inject(SpritesService);
    await sprites.loadSprites('assets/images/index.json').toPromise();
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  describe('selection', () => {
    it('should select items that are clicked', () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature();
      comp.category = 'weapons';
      fixture.detectChanges();

      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(0);

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});

      selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(1);
      expect(selection[0].id).toBe('club');

      price.triggerEventHandler('click', {});
      selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(0);
    });
    it('should multi-select items that are clicked while shiftKey is set', () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature({}, { inventory: 'club,short-sword' });
      comp.category = 'weapons';
      fixture.detectChanges();

      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(0);

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      const prices = fixture.debugElement.queryAll(By.css('.item-value'));
      prices.forEach((p) => {
        p.triggerEventHandler('click', { shiftKey: true });
      });

      selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(2);
      expect(selection[0].id).toBe('club');
      expect(selection[1].id).toBe('short-sword');

      // deselects when clicked again
      prices.forEach((p) => {
        p.triggerEventHandler('click', { shiftKey: true });
      });
      selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(0);
    });
    it('shows upgrades and downgrades with selected items', async () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature({}, { inventory: 'club,short-sword,broadsword' });
      comp.category = 'weapons';
      fixture.detectChanges();

      // Equip a short-sword
      const warrior = testAppGetPartyWithEquipment(world.store).find(
        (p) => p.type === 'warrior'
      );
      assertTrue(warrior, 'no warrior class in default party');
      const itemInstance = instantiateEntity<Weapon>(
        WEAPONS_DATA.find((f) => f.id === 'short-sword')
      );
      world.store.dispatch(new EntityAddItemAction(itemInstance));
      world.store.dispatch(new GameStateAddInventoryAction(itemInstance));
      // Unequip club first
      world.store.dispatch(
        new GameStateUnequipItemAction({
          entityId: warrior.eid,
          slot: 'weapon',
          itemId: warrior.weapon?.eid || '',
        })
      );
      world.store.dispatch(
        new GameStateEquipItemAction({
          entityId: warrior.eid,
          slot: 'weapon',
          itemId: itemInstance.eid,
        })
      );

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      const items = fixture.debugElement.queryAll(By.css('.item-value'));
      const clubItem = items[0];
      const shortSwordItem = items[1];
      const broadswordItem = items[2];

      // Selecting club shows downgrade
      clubItem.triggerEventHandler('click', {});
      fixture.detectChanges();
      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(1);
      expect(
        fixture.debugElement.query(By.css('.warrior > .downgrade'))
      ).not.toBeNull();

      // Selecting short-sword shows neither upgrade or downgrade
      shortSwordItem.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.warrior > .downgrade'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.warrior > .upgrade'))).toBeNull();

      // Selecting broadsword shows upgrade
      broadswordItem.triggerEventHandler('click', {});
      fixture.detectChanges();
      selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(1);
      expect(fixture.debugElement.query(By.css('.warrior > .upgrade'))).not.toBeNull();
    });
  });

  describe('buying', () => {
    it('should fail to buy selected item without enough money', () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature({}, { inventory: 'potion-large' });
      comp.category = 'misc';
      fixture.detectChanges();

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      const goldBefore = testAppGetPartyGold(world.store);

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});
      fixture.detectChanges();

      const buyBtn = fixture.debugElement.query(By.css('.btn-buy'));
      buyBtn.triggerEventHandler('click', {});
      fixture.detectChanges();

      // Gold is not decremented
      expect(testAppGetPartyGold(world.store)).toBe(goldBefore);

      // Item is not in inventory
      const inventory = testAppGetInventory(world.store);
      expect(inventory.length).toBe(0);
    });
    it('should buy selected item with enough money', () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature({}, { inventory: 'potion' });
      comp.category = 'misc';
      fixture.detectChanges();

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      const itemTemplate = ITEMS_DATA.find((f) => f.id === 'potion');
      assertTrue(itemTemplate, 'failed to find item template');
      const goldBefore = testAppGetPartyGold(world.store);

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});
      fixture.detectChanges();

      const buyBtn = fixture.debugElement.query(By.css('.btn-buy'));
      buyBtn.triggerEventHandler('click', {});
      fixture.detectChanges();

      // Does not clear selection when items are purchased
      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(1);

      // Paid for the item
      const goldAfter = testAppGetPartyGold(world.store);
      expect(goldAfter).toBe(goldBefore - itemTemplate.value);

      const inventory = testAppGetInventory(world.store);
      expect(inventory[0].id).toBe('potion');
    });
    it('should equip new gear on compatible party member when purchased', () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature();
      comp.category = 'weapons';
      fixture.detectChanges();

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      let party = testAppGetPartyWithEquipment(world.store);
      const oldEid = party[0].weapon?.eid || '';

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});

      const buyBtn = fixture.debugElement.query(By.css('.btn-buy'));
      buyBtn.triggerEventHandler('click', {});
      fixture.detectChanges();

      // Weapon is now equipped
      party = testAppGetPartyWithEquipment(world.store);
      expect(party[0].weapon?.eid || '').not.toBe(oldEid);

      // Does not clear selection when items are purchased
      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(1);
    });
  });
  describe('selling', () => {
    it('should sell items and receive gold', async () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature();
      comp.category = 'weapons';

      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);

      let inventory = testAppGetInventory(world.store);
      expect(inventory[0].id).toBe('potion');
      expect(inventory[1].id).toBe('potion');

      fixture.detectChanges();

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);
      await fixture.whenStable();

      // TODO: Why do I have to detect changes and click multiple times to get the tab to update?
      const sellTab = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      sellTab.triggerEventHandler('click', {});
      fixture.detectChanges();
      await fixture.whenStable();
      sellTab.triggerEventHandler('click', {});
      fixture.detectChanges();
      await fixture.whenStable();

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});
      fixture.detectChanges();
      await fixture.whenStable();

      const buyBtn = fixture.debugElement.query(By.css('.btn-sell'));
      buyBtn.triggerEventHandler('click', {});
      fixture.detectChanges();

      // Items go away when sold, so selection is cleared
      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(0);

      // The inventory is now smaller
      inventory = testAppGetInventory(world.store);
      expect(inventory.length).toBe(1);
    });
  });
});

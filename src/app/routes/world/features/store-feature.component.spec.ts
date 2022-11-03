import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { IPartyMember } from '../../../models/base-entity';
import {
  EntityAddBeingAction,
  EntityAddItemAction,
} from '../../../models/entity/entity.actions';
import { EntityWithEquipment } from '../../../models/entity/entity.model';
import { EntityItemTypes } from '../../../models/entity/entity.reducer';
import { instantiateEntity } from '../../../models/game-data/game-data.model';
import { ITEMS_DATA } from '../../../models/game-data/items';
import { WEAPONS_DATA } from '../../../models/game-data/weapons';
import {
  GameStateAddInventoryAction,
  GameStateEquipItemAction,
  GameStateNewAction,
} from '../../../models/game-state/game-state.actions';
import { GameState } from '../../../models/game-state/game-state.model';
import { Item, Weapon } from '../../../models/item';
import {
  getGameInventory,
  getGamePartyGold,
  getGamePartyWithEquipment,
} from '../../../models/selectors';
import { SpritesService } from '../../../models/sprites/sprites.service';
import { GameWorld } from '../../../services/game-world';
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

function getInventory(store: Store<AppState>): EntityItemTypes[] {
  let result: EntityItemTypes[] | undefined;
  store
    .select(getGameInventory)
    .pipe(
      take(1),
      map((f) => f.toJS())
    )
    .subscribe((s) => (result = s));
  return result as EntityItemTypes[];
}

function getPartyGold(store: Store<AppState>): number {
  let result = 0;
  store
    .select(getGamePartyGold)
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

function getParty(store: Store<AppState>): EntityWithEquipment[] {
  let result: EntityWithEquipment[] = [];
  store
    .select(getGamePartyWithEquipment)
    .pipe(
      map((f) => f.toJS()),
      take(1)
    )
    .subscribe((s) => (result = s));
  return result;
}

function getStoreSelection(obs: Observable<any>): Item[] {
  let result = new Set<Item>();
  obs.pipe(take(1)).subscribe((s) => (result = s));
  return [...result];
}

fdescribe('StoreFeatureComponent', () => {
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
    const warrior: IPartyMember = {
      id: 'warrior-class-id',
      eid: 'invalid-hero',
      status: [],
      type: 'warrior',
      name: 'warrior',
      level: 1,
      exp: 0,
      icon: '',
      hp: 20,
      maxhp: 20,
      mp: 20,
      maxmp: 20,
      strength: [10],
      agility: [10],
      vitality: [10],
      luck: [10],
      hitpercent: [10],
      intelligence: [10],
      magicdefense: [10],
    };
    const initialState: GameState = {
      party: Immutable.List<string>([warrior.eid]),
      inventory: Immutable.List<string>(),
      battleCounter: 0,
      keyData: Immutable.Map<string, any>(),
      gold: 100,
      combatZone: '',
      location: 'example',
      position: { x: 12, y: 8 },
      boardedShip: false,
      shipPosition: { x: 7, y: 23 },
    };
    world.store.dispatch(new GameStateNewAction(initialState));
    world.store.dispatch(new EntityAddBeingAction(warrior));
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
      const itemInstance = instantiateEntity<Weapon>(
        WEAPONS_DATA.find((f) => f.id === 'short-sword')
      );
      world.store.dispatch(new EntityAddItemAction(itemInstance));
      world.store.dispatch(new GameStateAddInventoryAction(itemInstance));
      world.store.dispatch(
        new GameStateEquipItemAction({
          entityId: 'invalid-hero',
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
      const downgrade = fixture.debugElement.query(By.css('.downgrade'));
      expect(downgrade).not.toBeNull();

      // Selecting short-sword shows neither upgrade or downgrade
      shortSwordItem.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.downgrade'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.upgrade'))).toBeNull();

      // Selecting broadsword shows upgrade
      broadswordItem.triggerEventHandler('click', {});
      fixture.detectChanges();
      selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(1);
      expect(fixture.debugElement.query(By.css('.upgrade'))).not.toBeNull();
    });
  });

  describe('buying', () => {
    it('should buy selected item with enough money', () => {
      const fixture = TestBed.createComponent(StoreFeatureComponent);
      const comp: StoreFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature({}, { inventory: 'potion' });
      comp.category = 'misc';
      fixture.detectChanges();

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});
      fixture.detectChanges();

      const buyBtn = fixture.debugElement.query(By.css('.btn-buy'));
      buyBtn.triggerEventHandler('click', {});
      fixture.detectChanges();

      // Does not clear selection when items are purchased
      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(1);

      const inventory = getInventory(world.store);
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

      let party = getParty(world.store);
      expect(party[0].weapon).toBeUndefined();

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});

      const buyBtn = fixture.debugElement.query(By.css('.btn-buy'));
      buyBtn.triggerEventHandler('click', {});
      fixture.detectChanges();

      // Weapon is now equipped
      party = getParty(world.store);
      expect(party[0].weapon).toBeDefined();

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

      const itemInstance = instantiateEntity<Item>(
        ITEMS_DATA.find((f) => f.id === 'potion')
      );
      world.store.dispatch(new EntityAddItemAction(itemInstance));
      world.store.dispatch(new GameStateAddInventoryAction(itemInstance));

      let inventory = getInventory(world.store);
      expect(inventory[0].id).toBe('potion');

      fixture.detectChanges();

      comp.enter(tileObject);
      fixture.detectChanges();
      expect(comp.active).toBe(true);

      const sellTab = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      sellTab.triggerEventHandler('click', {});
      fixture.detectChanges();
      await fixture.whenStable();

      const price = fixture.debugElement.query(By.css('.item-value'));
      price.triggerEventHandler('click', {});
      fixture.detectChanges();

      const buyBtn = fixture.debugElement.query(By.css('.btn-sell'));
      buyBtn.triggerEventHandler('click', {});
      fixture.detectChanges();

      // Items go away when sold, so selection is cleared
      let selection = getStoreSelection(comp.selected$);
      expect(selection.length).toBe(0);

      // The inventory is now empty
      inventory = getInventory(world.store);
      expect(inventory.length).toBe(0);
    });
  });
});

/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {
  Component,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import {RPGGame, NotificationService} from '../../services';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable, Subject, ReplaySubject} from 'rxjs';
import {IScene} from '../../../game/pow2/interfaces/IScene';
import {Item} from '../../models/item';
import {GameState} from '../../models/game-state/game-state.model';
import {
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
  GameStateRemoveInventoryAction
} from '../../models/game-state/game-state.actions';
import {StoreFeatureComponent} from '../../../game/rpg/components/features/storeFeatureComponent';
import * as Immutable from 'immutable';
import {
  getGamePartyGold,
  sliceGameState,
  getGameDataWeapons,
  getGameDataArmors,
  getGameDataItems,
  getGameInventory
} from '../../models/selectors';
import {EntityRemoveItemAction, EntityAddItemAction} from '../../models/entity/entity.actions';
import {ITemplateItem, ITemplateWeapon} from '../../models/game-data/game-data.model';
import {newGuid} from '../../models/being';

/**
 * Given a list of potential items, filter it to only ones that can be bartered in this store.
 * @param items The list of items to filter
 * @param groups The item groups that are supported by this store
 * @param level The level of items that are sold in this store
 * @returns {ITemplateItem[]} The filtered item list
 */
export function storeItemsFilter(items: ITemplateItem[], groups: string[], level: number): ITemplateItem[] {
  return items.filter((i: ITemplateItem) => {
    const levelMatch: boolean = (typeof i.level === 'undefined' || i.level === level);
    return levelMatch && itemInGroups(i, groups);
  });
}

/**
 * Given a list of potential items to sell, filter to only ones that can be bartered in this store.
 * @param items The list of items to filter
 * @param groups The item groups that are supported by this store
 * @returns {ITemplateItem[]} The filtered item list
 */
export function sellItemsFilter(items: ITemplateItem[], groups: string[]): ITemplateItem[] {
  return (items || []).filter((i: ITemplateItem) => {
    return itemInGroups(i, groups);
  });
}

/**
 * return true if the given item belongs to at least one of the given groups
 */
export function itemInGroups(item: ITemplateItem, groups: string[]): boolean {
  if (!item) {
    return false;
  }
  // If there are no groups, the item is OK
  let groupsMatch: boolean = !item.groups || groups.length === 0;
  // If there are groups, make sure it matches at least one of them
  (item.groups || []).forEach((group: string) => {
    groupsMatch = groupsMatch || groups.indexOf(group) !== -1;
  });
  return groupsMatch;

}

/**
 * The categories of store (tied to definition of feature in TMX map
 */
export type StoreInventoryCategories = 'weapons' | 'armor' | 'items';

@Component({
  selector: 'world-store',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./world-store.component.scss'],
  templateUrl: './world-store.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldStoreComponent implements OnDestroy {
  @Output() onClose = new EventEmitter();

  /** @internal */
  private _groups$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  /** @internal */
  private _level$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  /** @internal */
  private _category$: BehaviorSubject<StoreInventoryCategories> =
    new BehaviorSubject<StoreInventoryCategories>('items');
  /** @internal */
  private _weapons$: Observable<ITemplateWeapon[]> = this.store.select(getGameDataWeapons);
  /** @internal */
  private _armors$: Observable<ITemplateWeapon[]> = this.store.select(getGameDataArmors);
  /** @internal */
  private _items$: Observable<ITemplateWeapon[]> = this.store.select(getGameDataItems);
  /** @internal */
  private _name$ = new BehaviorSubject<string>('Invalid Store');
  /** @internal */
  private _selling$ = new BehaviorSubject<boolean>(false);

  /**
   * The item groups that this vendor sells
   */
  groups$: Observable<string[]> = this._groups$;

  /**
   * The amount of gold the party has to spend
   */
  partyGold$: Observable<number> = this.store.select(getGamePartyGold);

  /** The level of items available at this store */
  level$: Observable<number> = this._level$;

  /**
   * The category of store as determined by its map feature.
   * @type {ReplaySubject<StoreInventoryCategories>}
   */
  category$: Observable<StoreInventoryCategories> = this._category$;

  /**
   * The items available for sale at this store.
   */
  partyInventory$: Observable<Item[]> = this.store.select(getGameInventory)
    .combineLatest(this.category$, (inventory, category) => {
      return inventory.filter((i) => i.category === category);
    })
    .combineLatest(this.groups$, sellItemsFilter);

  /**
   * Calculate the inventory for the store. Filter by category, item grouping, and player level.
   */
  inventory$: Observable<ITemplateItem[]> = this._weapons$
    .combineLatest(this._armors$, this._items$, this.category$, (weapons, armors, items, cat) => {
      switch (cat) {
        case 'items':
          return items;
        case 'weapons':
          return weapons;
        case 'armor':
          return armors;
        default:
          console.error('world-store: unknown items category -> ' + cat);
          return [];
      }
    })
    .combineLatest(this.groups$, this.level$, storeItemsFilter);

  /**
   * The name of this (fine) establishment.
   */
  name$: Observable<string> = this._name$;

  /** Determine if the UI is in a selling state. */
  selling$: Observable<boolean> = this._selling$;

  /** @internal */
  _selected$ = new BehaviorSubject<Item>(null);
  /** The selected item to purchase/sell. */
  selected$: Observable<Item> = this._selected$;

  isBuying$: Observable<boolean> = Observable
    .combineLatest(this.selected$, this.selling$, (selected: boolean, selling: boolean) => {
      return !selected && !selling;
    });

  isSelling$: Observable<boolean> = Observable
    .combineLatest(this.selected$, this.selling$, (selected: boolean, selling: boolean) => {
      return !selected && selling;
    });

  /** Verb for the current buy/sell state for an action button */
  actionVerb$: Observable<string> = this.selling$.map((selling: boolean) => {
    return selling ? 'Sell' : 'Buy';
  });

  /** @internal */
  _onAction$ = new Subject<void>();
  /** @internal */
  _onToggleAction$ = new Subject<Item>();

  private _doToggleActionSubscription$ = this._onToggleAction$
    .throttleTime(500)
    .withLatestFrom(this.partyInventory$, (evt, inventory: Item[]) => {
      let selling = this._selling$.value;
      if (!selling) {
        if (inventory.length === 0) {
          this.notify.show("You don't have any inventory of this type to sell.", null, 1500);
          this._selling$.next(false);
          return;
        }
      }
      this._selling$.next(!selling);
    })
    .subscribe();

  /** Stream of clicks on the actionable button */
  private _doActionSubscription$ = this._onAction$
    .throttleTime(500)
    .switchMap(() => this.store.select(sliceGameState))
    .do((model: GameState) => {
      if (!this._selected$.value) {
        return;
      }
      const item = this._selected$.value;
      const isSelling = this._selling$.value;
      const value: number = item.value;
      if (!isSelling && value > model.gold) {
        this.notify.show("You don't have enough money");
        return;
      }

      this._selected$.next(null);
      this._selling$.next(false);

      if (isSelling) {
        this.notify.show(`Sold ${item.name} for ${item.value} gold.`, null, 1500);
        this.store.dispatch(new EntityRemoveItemAction(item.eid));
        this.store.dispatch(new GameStateRemoveInventoryAction(item));
        this.store.dispatch(new GameStateAddGoldAction(value));
      }
      else {
        const itemInstance = Immutable.fromJS(item).merge({
          eid: `${item.id}-${newGuid()}`,
          category: this._category$.value
        }).toJS();
        this.notify.show(`Purchased ${item.name}.`, null, 1500);
        this.store.dispatch(new GameStateAddGoldAction(-value));
        this.store.dispatch(new EntityAddItemAction(itemInstance));
        this.store.dispatch(new GameStateAddInventoryAction(itemInstance));
      }

    }).subscribe();
  /** Stream of clicks on the actionable button */
  actionClick$: Observable<MouseEvent> = new Subject<MouseEvent>();

  // Have to add @Input() here because decorators are not inherited with extends
  @Input() scene: IScene;

  constructor(public game: RPGGame,
              public notify: NotificationService,
              public store: Store<AppState>) {
  }

  ngOnDestroy(): void {
    this._doActionSubscription$.unsubscribe();
    this._doToggleActionSubscription$.unsubscribe();
  }

  @Input()
  set feature(feature: StoreFeatureComponent) {
    this._name$.next(feature.name);
    this._groups$.next(feature.host.groups);
    this._category$.next(feature.host.category);
  }

}

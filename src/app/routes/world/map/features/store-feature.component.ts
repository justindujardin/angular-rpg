import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ARMOR_DATA } from 'app/models/game-data/armors';
import { ITEMS_DATA } from 'app/models/game-data/items';
import { MAGIC_DATA } from 'app/models/game-data/magic';
import { WEAPONS_DATA } from 'app/models/game-data/weapons';
import * as Immutable from 'immutable';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { combineLatest, map, withLatestFrom } from 'rxjs/operators';
import { AppState } from '../../../../app.model';
import { NotificationService } from '../../../../components/notification/notification.service';
import {
  EntityAddItemAction,
  EntityRemoveItemAction,
} from '../../../../models/entity/entity.actions';
import {
  instantiateEntity,
  ITemplateArmor,
  ITemplateBaseItem,
  ITemplateMagic,
  ITemplateWeapon,
} from '../../../../models/game-data/game-data.model';
import {
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
  GameStateRemoveInventoryAction,
} from '../../../../models/game-state/game-state.actions';
import { GameState } from '../../../../models/game-state/game-state.model';
import { Item } from '../../../../models/item';
import {
  getGameInventory,
  getGamePartyGold,
  sliceGameState,
} from '../../../../models/selectors';
import { IScene } from '../../../../scene/scene.model';
import { RPGGame } from '../../../../services/rpg-game';
import { TiledFeatureComponent, TiledMapFeatureData } from '../map-feature.component';

/**
 * Given a list of potential items, filter it to only ones that can be bartered in this store.
 * @param items The list of items to filter
 * @param groups The item groups that are supported by this store
 * @param level The level of items that are sold in this store
 * @returns {ITemplateBaseItem[]} The filtered item list
 */
export function storeItemsFilter(
  items: Immutable.List<ITemplateBaseItem>,
  groups: string[],
  level: number
): Immutable.List<ITemplateBaseItem> {
  return <any>items.filter((i: ITemplateBaseItem) => {
    const levelMatch: boolean = typeof i.level === 'undefined' || i.level === level;
    return levelMatch && itemInGroups(i, groups);
  });
}

//
//
//
// TODO: Maps need to be updated to change "category" for stores to a list of item types
// because currently all stores show nothing to sell.
//
//

/**
 * Given a list of potential items to sell, filter to only ones that can be bartered in this store.
 * @param items The list of items to filter
 * @param groups The item groups that are supported by this store
 * @returns {ITemplateBaseItem[]} The filtered item list
 */
export function sellItemsFilter(
  items: Immutable.List<Item>,
  groups: string[]
): Immutable.List<Item> {
  return items
    .filter((i: Item) => {
      return itemInGroups(i, groups);
    })
    .toList();
}

export function getFeatureProperty(
  name: string,
  defaultValue = null
): (f: TiledMapFeatureData) => any {
  return (f: TiledMapFeatureData) => {
    return f?.properties?.[name] ? f.properties[name] : defaultValue;
  };
}

/**
 * return true if the given item belongs to at least one of the given groups
 */
export function itemInGroups(item: ITemplateBaseItem, groups: string[]): boolean {
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
export type StoreInventoryCategories = 'weapons' | 'armor' | 'magic' | 'misc';

@Component({
  selector: 'store-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./store-feature.component.scss'],
  templateUrl: './store-feature.component.html',
})
export class StoreFeatureComponent extends TiledFeatureComponent implements OnDestroy {
  // @ts-ignore
  @Input() feature: TiledMapFeatureData;
  @Input() scene: IScene;
  // @ts-ignore
  @Input() active: boolean;
  @Output() onClose = new EventEmitter();
  active$: Observable<boolean>;

  constructor(
    public game: RPGGame,
    public notify: NotificationService,
    public store: Store<AppState>
  ) {
    super();
  }

  ngOnDestroy(): void {
    this._doActionSubscription$.unsubscribe();
    this._doToggleActionSubscription$.unsubscribe();
  }

  /** @internal */
  private _level$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  /** @internal */
  private _weapons$: Observable<ITemplateWeapon[]> = from([WEAPONS_DATA]);
  /** @internal */
  private _armors$: Observable<ITemplateArmor[]> = from([ARMOR_DATA]);
  /** @internal */
  private _items$: Observable<ITemplateBaseItem[]> = from([ITEMS_DATA]);
  /** @internal */
  private _magics$: Observable<ITemplateMagic[]> = from([MAGIC_DATA]);
  /** @internal */
  private _selling$ = new BehaviorSubject<boolean>(false);

  /**
   * The name of this (fine) establishment.
   */
  name$: Observable<string> = this.feature$.pipe(map(getFeatureProperty('name')));

  /**
   * The item groups that this vendor sells
   */
  groups$: Observable<string[]> = this.feature$.pipe(
    map(getFeatureProperty('groups', []))
  );

  /**
   * The category of store as determined by its map feature.
   */
  category$: Observable<StoreInventoryCategories> = this.feature$.pipe(
    map(getFeatureProperty('category'))
  );

  /**
   * The amount of gold the party has to spend
   */
  partyGold$: Observable<number> = this.store.select(getGamePartyGold);

  /**
   * The level of items available at this store
   */
  level$: Observable<number> = this._level$;

  /**
   * The items that the party has available to sell to the merchant
   */
  partyInventory$: Observable<Immutable.List<Item>> = this.store
    .select(getGameInventory)
    .pipe(
      combineLatest(
        [this.category$],
        (inventory: Immutable.List<Item>, category: string) => {
          const result = inventory.filter((i) => i && i.category === category).toList();
          return result;
        }
      ),
      combineLatest(this.groups$, sellItemsFilter)
    );

  /**
   * Calculate the inventory for the store. Filter by category, item grouping, and player level.
   */
  inventory$: Observable<Immutable.List<ITemplateBaseItem>> = this._weapons$.pipe(
    combineLatest(
      [this._armors$, this._items$, this._magics$, this.category$],
      (weapons, armors, items, magics, cat: StoreInventoryCategories) => {
        switch (cat) {
          case 'magic':
            return magics.concat(items);
          case 'misc':
            return items;
          case 'weapons':
            return weapons;
          case 'armor':
            return armors;
          default:
            // If there is no category, the vendor can sell all types.
            return items.concat(weapons).concat(armors);
        }
      }
    ),
    combineLatest(this.groups$, this.level$, storeItemsFilter)
  );

  /** Determine if the UI is in a selling state. */
  selling$: Observable<boolean> = this._selling$;

  /** @internal */
  _selected$ = new BehaviorSubject<Item>(null);
  /** The selected item to purchase/sell. */
  selected$: Observable<Item> = this._selected$;

  isBuying$: Observable<boolean> = this.selected$.pipe(
    combineLatest([this.selling$], (selected: Item, selling: boolean) => {
      return !selected && !selling;
    })
  );

  isSelling$: Observable<boolean> = this.selected$.pipe(
    combineLatest([this.selling$], (selected: Item, selling: boolean) => {
      return !selected && selling;
    })
  );

  /** Verb for the current buy/sell state for an action button */
  actionVerb$: Observable<string> = this.selling$.pipe(
    map((selling: boolean) => {
      return selling ? 'Sell' : 'Buy';
    })
  );

  /** @internal */
  _onAction$ = new Subject<void>();
  /** @internal */
  _onToggleAction$ = new Subject<Item>();

  private _doToggleActionSubscription$ = this._onToggleAction$
    .pipe(
      withLatestFrom(this.partyInventory$, (evt, inventory: Item[]) => {
        let selling = this._selling$.value;
        if (!selling) {
          if (inventory.length === 0) {
            this.notify.show(
              "You don't have any inventory of this type to sell.",
              null,
              1500
            );
            this._selling$.next(false);
            return;
          }
        }
        this._selling$.next(!selling);
      })
    )
    .subscribe();

  /** Stream of clicks on the actionable button */
  private _doActionSubscription$ = this._onAction$
    .pipe(
      withLatestFrom(this.store.select(sliceGameState), (evt, model: GameState) => {
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
          this.store.dispatch(new GameStateRemoveInventoryAction(item));
          this.store.dispatch(new EntityRemoveItemAction(item.eid));
          this.store.dispatch(new GameStateAddGoldAction(value));
        } else {
          const itemInstance = instantiateEntity<Item>(item);
          this.notify.show(`Purchased ${item.name}.`, null, 1500);
          this.store.dispatch(new GameStateAddGoldAction(-value));
          this.store.dispatch(new EntityAddItemAction(itemInstance));
          this.store.dispatch(new GameStateAddInventoryAction(itemInstance));
        }
      })
    )
    .subscribe();
}

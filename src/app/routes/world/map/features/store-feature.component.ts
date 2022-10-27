import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { ARMOR_DATA } from 'app/models/game-data/armors';
import { ITEMS_DATA } from 'app/models/game-data/items';
import { MAGIC_DATA } from 'app/models/game-data/magic';
import { WEAPONS_DATA } from 'app/models/game-data/weapons';
import * as Immutable from 'immutable';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { combineLatest, first, map } from 'rxjs/operators';
import { AppState } from '../../../../app.model';
import { NotificationService } from '../../../../components/notification/notification.service';
import { IPartyMember } from '../../../../models/base-entity';
import {
  EntityAddItemAction,
  EntityRemoveItemAction,
} from '../../../../models/entity/entity.actions';
import { EntityWithEquipment } from '../../../../models/entity/entity.model';
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
  getGamePartyWithEquipment,
  sliceGameState,
} from '../../../../models/selectors';
import { IScene } from '../../../../scene/scene.model';
import { RPGGame } from '../../../../services/rpg-game';
import { TiledFeatureComponent, TiledMapFeatureData } from '../map-feature.component';

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

type StoreComparableTypes = ITemplateWeapon | ITemplateArmor | ITemplateMagic;

interface IEquipmentDifference {
  member: IPartyMember;
  difference: number;
  diff: string;
}

@Component({
  selector: 'store-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./store-feature.component.scss'],
  templateUrl: './store-feature.component.html',
})
export abstract class StoreFeatureComponent extends TiledFeatureComponent {
  /** The store items category must be set in a subclass */
  abstract category: StoreInventoryCategories;

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
   * The amount of gold the party has to spend
   */
  partyGold$: Observable<number> = this.store.select(getGamePartyGold);

  /**
   * The items that the party has available to sell to the merchant
   */
  partyInventory$: Observable<Immutable.List<Item>> = this.store
    .select(getGameInventory)
    .pipe(
      map((inventory: Immutable.List<Item>) => {
        const result = inventory.toList();
        return result;
      })
    );

  /**
   * Calculate the inventory for the store. Filter by category, item grouping, and player level.
   */
  inventory$: Observable<ITemplateBaseItem[]> = this._weapons$.pipe(
    combineLatest(
      [
        this._armors$,
        this._items$,
        this._magics$,
        this._feature$,
        this._selling$,
        this.partyInventory$,
      ],
      (
        weapons: ITemplateWeapon[],
        armors: ITemplateArmor[],
        items: ITemplateBaseItem[],
        magics: ITemplateMagic[],
        feature: TiledMapFeatureData,
        selling: boolean,
        partyInventory: Immutable.List<Item>
      ) => {
        if (selling) {
          return partyInventory.toJS();
        }
        const inventory: string = feature.properties?.inventory || '';
        const inventoryIds = inventory.split(',');
        const inventoryIdMap = {};
        inventoryIds.forEach((id) => (inventoryIdMap[id] = true));
        let data = [];
        switch (this.category) {
          case 'magic':
            data = magics.filter((item) => inventoryIdMap[item.id]);
            break;
          case 'misc':
            data = items.filter((item) => inventoryIdMap[item.id]);
            break;
          case 'weapons':
            data = weapons.filter((item) => inventoryIdMap[item.id]);
            break;
          case 'armor':
            data = armors.filter((item) => inventoryIdMap[item.id]);
            break;
          default:
            // If there is no category, the vendor can sell all types.
            data = items.concat(weapons).concat(armors);
        }
        return data;
      }
    )
  );

  /** Determine if the UI is in a selling state. */
  selling$: Observable<boolean> = this._selling$;

  /** @internal */
  _selected$ = new BehaviorSubject<Set<Item>>(new Set());
  /** The selected item to purchase/sell. */
  selected$: Observable<Set<Item>> = this._selected$;
  /** The currently selected player entity with its equipment resolved to items rather than item ids */
  partyWithEquipment$: Observable<Immutable.List<EntityWithEquipment>> =
    this.store.select(getGamePartyWithEquipment);

  differences$: Observable<IEquipmentDifference[]> = this.selected$.pipe(
    combineLatest(
      [this.partyWithEquipment$],
      (
        selected: Set<Item>,
        party: Immutable.List<EntityWithEquipment>
      ): IEquipmentDifference[] => {
        let results: IEquipmentDifference[] = [];
        if (selected.size != 1) {
          results = party.map((pm) => ({ member: pm, difference: 0, diff: '' })).toJS();
        } else {
          const compareItem = [...selected][0];
          results = party
            .map((pm: EntityWithEquipment) => {
              // TODO: the item types here aren't quite right.
              const weapon: ITemplateWeapon = compareItem as any;
              const armor: ITemplateArmor = compareItem as any;

              // Only compare items we can wield
              const usedBy = compareItem.usedby || [];
              if (usedBy.indexOf(pm.type) !== -1 || usedBy.length === 0) {
                if (pm.weapon && weapon.attack !== undefined) {
                  return { member: pm, difference: weapon.attack - pm.weapon.attack };
                } else if (pm[armor.type] && armor.defense !== undefined) {
                  return {
                    member: pm,
                    difference: armor.defense - pm[armor.type].defense,
                  };
                }
              }
              return { member: pm, difference: 0, diff: '' };
            })
            .toJS();
        }
        return results.map((r) => {
          if (!r.hasOwnProperty('diff')) {
            if (r.difference > 0) {
              r.diff = `+${r.difference}`;
            } else if (r.difference < 0) {
              r.diff = `-${r.difference}`;
            } else {
              r.diff = '0';
            }
          }
          return r;
        });
      }
    )
  );

  isBuying$: Observable<boolean> = this.selected$.pipe(
    combineLatest([this.selling$], (selected: Set<Item>, selling: boolean) => {
      return !selected.size && !selling;
    })
  );

  isSelling$: Observable<boolean> = this.selected$.pipe(
    combineLatest([this.selling$], (selected: Set<Item>, selling: boolean) => {
      return !selected.size && selling;
    })
  );

  /** Verb for the current buy/sell state for an action button */
  actionVerb$: Observable<string> = this.selling$.pipe(
    map((selling: boolean) => {
      return selling ? 'Sell' : 'Buy';
    })
  );

  close() {
    this.onClose.next();
    this._selected$.next(new Set());
    this._selling$.next(false);
  }
  trackByEid(index, item) {
    return item.member.id;
  }
  toggleRowSelection(event, row) {
    // Shift for multiple selection
    if (event.shiftKey) {
      if (this._selected$.value.has(row)) {
        this._selected$.value.delete(row);
      } else {
        this._selected$.value.add(row);
      }
      this._selected$.next(this._selected$.value);
    } else {
      // Toggle selection state
      if (this._selected$.value.has(row)) {
        this._selected$.next(new Set([]));
      } else {
        this._selected$.next(new Set([row]));
      }
    }
  }

  sellItems() {
    const items: Item[] = [...this._selected$.value];
    const totalCost: number = items.reduce(
      (prev: number, current: Item) => prev + current.value,
      0
    );
    this._selected$.next(new Set());
    items.forEach((item) => {
      this.store.dispatch(new GameStateRemoveInventoryAction(item));
      this.store.dispatch(new EntityRemoveItemAction(item.eid));
    });
    this.store.dispatch(new GameStateAddGoldAction(totalCost));
    this.notify.show(`Sold ${items.length} items for ${totalCost} gold.`, null, 1500);
  }
  buyItems() {
    this.store
      .select(sliceGameState)
      .pipe(
        first(),
        map((state: GameState) => {
          const items: Item[] = [...this._selected$.value];
          const totalCost: number = items.reduce(
            (prev: number, current: Item) => prev + current.value,
            0
          );
          if (totalCost > state.gold) {
            this.notify.show("You don't have enough money");
            return;
          }
          items.forEach((item) => {
            const itemInstance = instantiateEntity<Item>(item);
            this.store.dispatch(new EntityAddItemAction(itemInstance));
            this.store.dispatch(new GameStateAddInventoryAction(itemInstance));
          });
          this.store.dispatch(new GameStateAddGoldAction(-totalCost));
          this.notify.show(
            `Purchased ${items.length} items for ${totalCost} gold.`,
            null,
            1500
          );
        })
      )
      .subscribe();
  }

  tabChange(event: MatTabChangeEvent) {
    const isSelling = this._selling$.value;
    const newTab = event.tab.textLabel;
    if (newTab === 'Buy' && isSelling) {
      this._selling$.next(false);
    } else if (newTab === 'Sell' && !isSelling) {
      this._selling$.next(true);
    } else {
      return;
    }
    this._selected$.next(new Set());
  }
}

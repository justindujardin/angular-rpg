import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ARMOR_DATA } from 'app/models/game-data/armors';
import { ITEMS_DATA } from 'app/models/game-data/items';
import { MAGIC_DATA } from 'app/models/game-data/magic';
import { WEAPONS_DATA } from 'app/models/game-data/weapons';
import * as Immutable from 'immutable';
import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { IEntityObject, IPartyMember } from '../../../models/base-entity';
import {
  EntityAddItemAction,
  EntityRemoveItemAction,
} from '../../../models/entity/entity.actions';
import { EntitySlots, EntityWithEquipment } from '../../../models/entity/entity.model';
import {
  EquipmentSlotTypes,
  EQUIPMENT_SLOTS,
  instantiateEntity,
  ITemplateArmor,
  ITemplateBaseItem,
  ITemplateMagic,
  ITemplateWeapon,
} from '../../../models/game-data/game-data.model';
import {
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
  GameStateEquipItemAction,
  GameStateRemoveInventoryAction,
  GameStateUnequipItemAction,
} from '../../../models/game-state/game-state.actions';
import { GameState } from '../../../models/game-state/game-state.model';
import { Item } from '../../../models/item';
import {
  getGameInventory,
  getGamePartyGold,
  getGamePartyWithEquipment,
  sliceGameState,
} from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

/**
 * The categories of store (tied to definition of feature in TMX map
 */
export type StoreInventoryCategories = 'weapons' | 'armor' | 'magic' | 'misc';

interface IEquipmentDifference {
  member: IPartyMember;
  difference: number;
  diff: string;
}

export interface IStoreFeatureProperties extends IMapFeatureProperties {
  inventory: string;
}

@Component({
  selector: 'store-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./store-feature.component.scss'],
  templateUrl: './store-feature.component.html',
})
export class StoreFeatureComponent extends MapFeatureComponent {
  @Input() feature: ITiledObject<IStoreFeatureProperties> | null = null;
  /** The store items category must be set in a subclass */
  category: StoreInventoryCategories;

  @Output() onClose = new EventEmitter();
  active$: Observable<boolean>;

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
  name$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject<any> | null) => f?.name || '')
  );

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
  inventory$: Observable<ITemplateBaseItem[]> = combineLatest([
    this._weapons$,
    this._armors$,
    this._items$,
    this._magics$,
    this._feature$,
    this._selling$,
    this.partyInventory$,
  ]).pipe(
    map(
      (
        params: [
          ITemplateWeapon[] | null,
          ITemplateArmor[] | null,
          ITemplateBaseItem[] | null,
          ITemplateMagic[] | null,
          ITiledObject<any> | null,
          boolean,
          Immutable.List<Item> | null
        ]
      ): ITemplateBaseItem[] => {
        const weapons: ITemplateWeapon[] | null = params[0];
        const armors: ITemplateArmor[] | null = params[1];
        const items: ITemplateBaseItem[] | null = params[2];
        const magics: ITemplateMagic[] | null = params[3];
        const feature: ITiledObject<any> | null = params[4];
        const selling: boolean = params[5];
        const partyInventory: Immutable.List<Item> | null = params[6];
        if (!weapons || !armors || !items || !magics || !feature || !partyInventory) {
          return [];
        }
        if (selling) {
          return partyInventory.toJS() as ITemplateBaseItem[];
        }
        const inventory: string = feature.properties?.inventory || '';
        const inventoryIds = inventory.split(',');
        const inventoryIdMap: { [id: string]: boolean } = {};
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

  dataSource$ = this.inventory$.pipe(map((data) => new MatTableDataSource(data)));

  /** Determine if the UI is in a selling state. */
  selling$: Observable<boolean> = this._selling$;

  /** @internal */
  _selected$ = new BehaviorSubject<Set<Item>>(new Set());
  /** The selected item to purchase/sell. */
  selected$: Observable<Set<Item>> = this._selected$;
  /** The currently selected player entity with its equipment resolved to items rather than item ids */
  partyWithEquipment$: Observable<Immutable.List<EntityWithEquipment>> =
    this.store.select(getGamePartyWithEquipment);

  differences$: Observable<IEquipmentDifference[]> = combineLatest([
    this.selected$,
    this.partyWithEquipment$,
  ]).pipe(
    map(
      (
        params: [Set<Item>, Immutable.List<EntityWithEquipment>]
      ): IEquipmentDifference[] => {
        const selected: Set<Item> = params[0];
        const party: Immutable.List<EntityWithEquipment> = params[1];

        let results: IEquipmentDifference[] = [];
        if (selected.size != 1) {
          results = party
            .map((pm) => ({ member: pm, difference: 0, diff: '' }))
            .toJS() as IEquipmentDifference[];
        } else {
          const compareItem = [...selected][0];
          results = party
            .map((pm?: EntityWithEquipment) => {
              if (!pm) {
                return;
              }
              // TODO: the item types here aren't quite right.
              const weapon: ITemplateWeapon = compareItem as any;
              const armor: ITemplateArmor = compareItem as any;

              // Only compare items we can wield
              const usedBy = compareItem.usedby || [];
              if (usedBy.indexOf(pm.type) !== -1 || usedBy.length === 0) {
                if (weapon.attack !== undefined) {
                  // Compare to current weapon
                  if (pm.weapon) {
                    return { member: pm, difference: weapon.attack - pm.weapon.attack };
                  }
                  // Has no current weapon
                  return {
                    member: pm,
                    difference: weapon.attack,
                  };
                } else if (armor.defense !== undefined) {
                  // Compare to current armor piece
                  const armorPiece = pm[armor.type];
                  if (armorPiece) {
                    return {
                      member: pm,
                      difference: armor.defense - armorPiece.defense,
                    };
                  }
                  // Has no current armor piece
                  return {
                    member: pm,
                    difference: armor.defense,
                  };
                }
              }
              // Cannot be equipped
              return { member: pm, difference: 0, diff: '' };
            })
            .toJS() as IEquipmentDifference[];
        }
        return results.map((r) => {
          if (!r.hasOwnProperty('diff')) {
            if (r.difference > 0) {
              r.diff = `+${r.difference}`;
            } else if (r.difference < 0) {
              r.diff = `-${r.difference}`;
            } else {
              r.diff = '=';
            }
          }
          return r;
        });
      }
    )
  );

  /** Verb for the current buy/sell state for an action button */
  actionVerb$: Observable<string> = this.selling$.pipe(
    map((selling: boolean) => {
      return selling ? 'Sell' : 'Buy';
    })
  );

  /** The GameState, but only valid when buying */
  buyingState$: Observable<[GameState, Immutable.List<EntityWithEquipment>] | null> =
    combineLatest([
      this.store.select(sliceGameState),
      this.selling$,
      this.partyWithEquipment$,
    ]).pipe(
      map((params: [GameState, boolean, Immutable.List<EntityWithEquipment>]) => {
        const state: GameState = params[0];
        const isSelling: boolean = params[1];
        const party: Immutable.List<EntityWithEquipment> = params[2];
        return !isSelling ? [state, party] : null;
      })
    );

  /** The Selection, but only valid when selling */
  sellingState$: Observable<Item[] | null> = combineLatest([
    this.selling$,
    this.partyInventory$,
  ]).pipe(
    map((params: [boolean, Immutable.List<Item>]) => {
      const isSelling: boolean = params[0];
      const inventory: Immutable.List<Item> = params[1];
      return isSelling ? inventory.toJS() : null;
    })
  );

  close() {
    this.onClose.next();
    this._selected$.next(new Set());
    this._selling$.next(false);
  }
  trackByEid(index: number, item: IEquipmentDifference) {
    return item.member.id;
  }
  toggleRowSelection(event: MouseEvent, row: Item) {
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

  sellItems(items: Item[]) {
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
    this.notify.show(
      `Sold ${items.length} items for ${totalCost} gold.`,
      undefined,
      1500
    );
  }
  buyItems(state: GameState, party: Immutable.List<EntityWithEquipment>) {
    const items: Item[] = [...this._selected$.value];
    const totalCost: number = items.reduce(
      (prev: number, current: Item) => prev + current.value,
      0
    );
    if (totalCost > state.gold) {
      this.notify.show("You don't have enough money");
      return;
    }

    let toEquipItem: Item | null = null;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemInstance = instantiateEntity<Item>(item);
      this.store.dispatch(new EntityAddItemAction(itemInstance));
      this.store.dispatch(new GameStateAddInventoryAction(itemInstance));
      if (items.length === 1) {
        toEquipItem = itemInstance;
      }
    }
    this.store.dispatch(new GameStateAddGoldAction(-totalCost));

    // Equip newly purchased items if there's only one and it can only be
    // wielded by one class.
    const types: EquipmentSlotTypes[] = [...EQUIPMENT_SLOTS];
    if (
      items.length === 1 &&
      toEquipItem &&
      types.indexOf(toEquipItem?.type as EquipmentSlotTypes)
    ) {
      const toEquip = party.find((p) => {
        assertTrue(p, 'invalid player entity in party');
        if (toEquipItem?.type === 'item') {
          return false;
        }
        // If anyone can equip it, the first player always gets it (sad)
        if (toEquipItem?.usedby?.length === 0) {
          return true;
        }
        return toEquipItem?.usedby?.indexOf(p.type) !== -1;
      });
      // Found equip target
      if (toEquip) {
        // Unequip anything that's already there
        if (toEquip.hasOwnProperty(toEquipItem?.type)) {
          const oldItem: IEntityObject | null = (toEquip as any)[toEquipItem?.type];
          if (oldItem) {
            this.store.dispatch(
              new GameStateUnequipItemAction({
                entityId: toEquip.eid,
                slot: toEquipItem.type as keyof EntitySlots,
                itemId: oldItem.eid,
              })
            );
          }
        }
        this.store.dispatch(
          new GameStateEquipItemAction({
            entityId: toEquip.eid,
            slot: toEquipItem.type as keyof EntitySlots,
            itemId: toEquipItem.eid,
          })
        );
      }
      this.notify.show(
        `Purchased ${toEquipItem.name} for ${totalCost} gold and equipped it on ${toEquip?.name}.`,
        undefined,
        5000
      );
      return;
    }

    const itemText = items.length === 1 ? `${items[0].name}` : `${items.length} items`;
    this.notify.show(
      `Purchased ${itemText} items for ${totalCost} gold.`,
      undefined,
      1500
    );
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

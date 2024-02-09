import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { BehaviorSubject, EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { combineLatest, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { CombatService } from '../../models/combat/combat.service';
import {
  Entity,
  EntitySlots,
  EntityWithEquipment,
} from '../../models/entity/entity.model';
import { EntityItemTypes } from '../../models/entity/entity.reducer';
import {
  EquipmentSlotTypes,
  EQUIPMENT_SLOTS,
} from '../../models/game-data/game-data.model';
import {
  GameStateEquipItemAction,
  GameStateUnequipItemAction,
} from '../../models/game-state/game-state.actions';
import { Item } from '../../models/item';
import {
  getEntityEquipment,
  getGameInventory,
  getGameParty,
} from '../../models/selectors';
import { RPGGame } from '../../services/rpg-game';
import { NotificationService } from '../notification/notification.service';

/** @internal to PartyInventoryComponent */
interface PartyInventoryEquipmentEvent {
  item: Item;
  slot: string;
}

@Component({
  selector: 'party-inventory',
  templateUrl: './party-inventory.component.html',
  styleUrls: ['./party-inventory.component.scss'],
})
export class PartyInventoryComponent implements OnDestroy {
  @Input()
  active: boolean = false;

  party$: Observable<Immutable.List<Entity | undefined>> =
    this.store.select(getGameParty);

  /**
   * Emit on this subject to update the current index.
   */
  public doChangeIndex$: Subject<number> = new BehaviorSubject<number>(0);

  /**
   * Emit on this subject to equip an item to a slot
   */
  public doEquip$: Subject<PartyInventoryEquipmentEvent> =
    new Subject<PartyInventoryEquipmentEvent>();

  /**
   * Emit on this subject to unequip an item from a slot
   * @type {Subject<PartyInventoryEquipmentEvent>}
   */
  public doUnequip$: Subject<PartyInventoryEquipmentEvent> =
    new Subject<PartyInventoryEquipmentEvent>();

  /**
   * The currently selected player index in the party list. If the index is out of bounds, wrap around
   * by moving to the opposite end of the list. i.e. if the index is greater than the length go back to
   * index 0, and if it's less than 0 go to the last index.
   */
  currentIndex$: Observable<number> = this.doChangeIndex$.pipe(
    combineLatest(this.party$, (index: number, party: Immutable.List<Entity>) => {
      if (index >= party.count()) {
        return 0;
      } else if (index < 0) {
        return party.count() - 1;
      }
      return index;
    }),
  );

  /** The currently selected player entity with its equipment resolved to items rather than item ids */
  currentEntity$: Observable<EntityWithEquipment> = this.currentIndex$.pipe(
    combineLatest(this.party$, (index: number, party: Immutable.List<Entity>) => {
      return party.get(index);
    }),
    switchMap((entity: Entity) => {
      return entity?.eid ? this.store.select(getEntityEquipment(entity.eid)) : EMPTY;
    }),
  );
  /** Stream of inventory that the currentEntity$ can equip */
  inventory$: Observable<EntityItemTypes[]> = this.store.select(getGameInventory).pipe(
    combineLatest(
      this.currentEntity$,
      (inventory: Immutable.List<EntityItemTypes>, member: EntityWithEquipment) => {
        return inventory
          .filter((i?: EntityItemTypes) => {
            // Is an item with a known equipment slot
            if (!i) {
              return false;
            }
            if (EQUIPMENT_SLOTS.indexOf(i.type as EquipmentSlotTypes) !== -1) {
              // If usedby is empty, anyone can use it
              if ((i.usedby || []).length === 0) {
                return true;
              }
              // If the player type is in the usedby array
              if (i.usedby && i.usedby.includes(member.type)) {
                return true;
              }
            }
            return false;
          })
          .toList()
          .toJS();
      },
    ),
  );
  /** Action generator from equip stream */
  private _equipSubscription: Subscription = this.doEquip$
    .pipe(
      withLatestFrom(
        this.currentEntity$,
        (event: PartyInventoryEquipmentEvent, entity: Entity) => {
          if (event.item.usedby && !event.item.usedby.find((e) => e === entity.type)) {
            return this.notify.show(`${entity.name} cannot equip this item`);
          }
          const slot = event.slot as keyof EntitySlots;
          if (entity[slot]) {
            const oldItem: any = entity[slot];
            this.store.dispatch(
              new GameStateUnequipItemAction({
                entityId: entity.eid,
                slot: slot,
                itemId: oldItem.eid,
              }),
            );
          }
          this.store.dispatch(
            new GameStateEquipItemAction({
              entityId: entity.eid,
              slot: slot,
              itemId: event.item.eid,
            }),
          );
        },
      ),
    )
    .subscribe();

  /** Action generator from unequip stream */
  private _unequipSubscription: Subscription = this.doUnequip$
    .pipe(
      withLatestFrom(
        this.currentEntity$,
        (event: PartyInventoryEquipmentEvent, entity: Entity) => {
          const slot = event.slot as keyof EntitySlots;
          this.store.dispatch(
            new GameStateUnequipItemAction({
              entityId: entity.eid,
              slot: slot,
              itemId: event.item.eid,
            }),
          );
        },
      ),
    )
    .subscribe();

  constructor(
    public game: RPGGame,
    public store: Store<AppState>,
    public combatService: CombatService,
    public notify: NotificationService,
  ) {}

  ngOnDestroy(): void {
    this._equipSubscription.unsubscribe();
    this._unequipSubscription.unsubscribe();
  }

  nextCharacter() {
    this.currentIndex$.pipe(take(1)).subscribe((curr: number) => {
      this.doChangeIndex$.next(curr + 1);
    });
  }

  previousCharacter() {
    this.currentIndex$.pipe(take(1)).subscribe((curr: number) => {
      this.doChangeIndex$.next(curr - 1);
    });
  }
}

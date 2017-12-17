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
import {Component, Input, OnDestroy} from '@angular/core';
import {ItemModel} from '../../../game/rpg/models/itemModel';
import {WeaponModel} from '../../../game/rpg/models/weaponModel';
import {ArmorModel} from '../../../game/rpg/models/armorModel';
import {HeroModel} from '../../../game/rpg/models/heroModel';
import {UsableModel} from '../../../game/rpg/models/usableModel';
import {GameStateModel} from '../../../game/rpg/models/gameStateModel';
import {RPGGame} from '../../services/rpg-game';
import {NotificationService} from '../notification/notification.service';
import {Item} from '../../models/item';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {Entity, EntitySlots, EntityWithEquipment} from '../../models/entity/entity.model';
import {getEntityEquipment, getGameInventory, getGameParty} from '../../models/selectors';
import * as Immutable from 'immutable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {GameStateEquipItemAction, GameStateUnequipItemAction} from '../../models/game-state/game-state.actions';
import {EntityItemTypes} from '../../models/entity/entity.reducer';
import {CombatService} from '../../models/combat/combat.service';

/** @internal to PartyInventoryComponent */
interface PartyInventoryEquipmentEvent {
  item: Item;
  slot: keyof EntitySlots;
}

@Component({
  selector: 'party-inventory',
  templateUrl: './party-inventory.component.html',
  styleUrls: ['./party-inventory.component.scss']
})
export class PartyInventoryComponent implements OnDestroy {
  @Input()
  active: boolean = false;

  party$: Observable<Immutable.List<Entity>> = this.store.select(getGameParty);

  /** Stream of all inventory excluding items */
  inventory$: Observable<Immutable.List<Item>> = this.store.select(getGameInventory)
    .map((inventory: Immutable.List<EntityItemTypes>) => {
      return inventory.filter((i: EntityItemTypes) => {
        return i.type !== 'item';
      });
    });

  /**
   * Emit on this subject to update the current index.
   */
  public doChangeIndex$: Subject<number> = new BehaviorSubject<number>(0);

  /**
   * Emit on this subject to equip an item to a slot
   */
  public doEquip$: Subject<PartyInventoryEquipmentEvent> = new Subject<PartyInventoryEquipmentEvent>();

  /**
   * Emit on this subject to unequip an item from a slot
   * @type {Subject<PartyInventoryEquipmentEvent>}
   */
  public doUnequip$: Subject<PartyInventoryEquipmentEvent> = new Subject<PartyInventoryEquipmentEvent>();

  /**
   * The currently selected player index in the party list. If the index is out of bounds, wrap around
   * by moving to the opposite end of the list. i.e. if the index is greater than the length go back to
   * index 0, and if it's less than 0 go to the last index.
   */
  currentIndex$: Observable<number> =
    this.doChangeIndex$.combineLatest(this.party$, (index: number, party: Immutable.List<Entity>) => {
      if (index >= party.count()) {
        return 0;
      }
      else if (index < 0) {
        return party.count() - 1;
      }
      return index;
    });

  /** The currently selected player entity with its equipment resolved to items rather than item ids */
  currentEntity$: Observable<EntityWithEquipment> = this.currentIndex$
    .combineLatest(this.party$, (index: number, party: Immutable.List<Entity>) => {
      return party.get(index);
    })
    .switchMap((entity: Entity) => {
      return this.store.select(getEntityEquipment(entity.eid));
    });

  /** Action generator from equip stream */
  private _equipSubscription: Subscription =
    this.doEquip$.withLatestFrom(this.currentEntity$, (event: PartyInventoryEquipmentEvent, entity: Entity) => {
      if (event.item.usedby && !event.item.usedby.find((e) => e === entity.type)) {
        return this.notify.show(`${entity.name} cannot equip this item`);
      }
      if (entity[event.slot]) {
        return this.notify.show(`${entity.name} already has item in ${event.slot}`);
      }
      this.store.dispatch(new GameStateEquipItemAction({
        entityId: entity.eid,
        slot: event.slot,
        itemId: event.item.eid
      }));
    }).subscribe();

  /** Action generator from unequip stream */
  private _unequipSubscription: Subscription =
    this.doUnequip$.withLatestFrom(this.currentEntity$, (event: PartyInventoryEquipmentEvent, entity: Entity) => {
      this.store.dispatch(new GameStateUnequipItemAction({
        entityId: entity.eid,
        slot: event.slot,
        itemId: event.item.eid
      }));
    }).subscribe();

  constructor(public game: RPGGame,
              public store: Store<AppState>,
              public combatService: CombatService,
              public notify: NotificationService) {
  }

  ngOnDestroy(): void {
    this._equipSubscription.unsubscribe();
    this._unequipSubscription.unsubscribe();
  }

  nextCharacter() {
    this.currentIndex$.take(1).subscribe((curr: number) => {
      this.doChangeIndex$.next(curr + 1);
    });
  }

  previousCharacter() {
    this.currentIndex$.take(1).subscribe((curr: number) => {
      this.doChangeIndex$.next(curr - 1);
    });
  }
}

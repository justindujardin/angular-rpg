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
import {Component, Input} from '@angular/core';
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
import {Entity} from '../../models/entity/entity.model';
import {getGameInventory, getGameParty} from '../../models/selectors';
import * as Immutable from 'immutable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'party-inventory',
  templateUrl: './party-inventory.component.html',
  styleUrls: ['./party-inventory.component.scss']
})
export class PartyInventoryComponent {
  @Input()
  active: boolean = false;

  party$: Observable<Immutable.List<Entity>> = this.store.select(getGameParty);
  inventory$: Observable<Immutable.List<Item>> = this.store.select(getGameInventory);

  /**
   * Emit on this subject to update the current index.
   */
  public doChangeIndex$: Subject<number> = new BehaviorSubject<number>(0);

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

  /** The currently selected player entity */
  currentEntity$: Observable<Entity> =
    this.currentIndex$.combineLatest(this.party$, (index: number, party: Immutable.List<Entity>) => {
      return party.get(index);
    });

  constructor(public game: RPGGame,
              public store: Store<AppState>,
              public notify: NotificationService) {
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

  equipItem(item: Item) {
    console.warn('entity-inventory: implement equip');
    // var hero: Entity = this.character;
    // if (!this.model.inventory || !item || !hero) {
    //   return;
    // }
    //
    // var users = item.usedby;
    // if (users && _.indexOf(users, hero.type) === -1) {
    //   this.notify.show(`${hero.name} cannot equip this item`);
    //   return;
    // }
    //
    // if (item instanceof ArmorModel) {
    //   var old: ArmorModel = hero.equipArmor(item);
    //   if (old) {
    //     this.model.addInventory(old);
    //   }
    // }
    // else if (item instanceof WeaponModel) {
    //   // Remove any existing weapon first
    //   if (hero.weapon) {
    //     this.model.addInventory(hero.weapon);
    //   }
    //   hero.weapon = <WeaponModel>item;
    // }
    // else if (item instanceof UsableModel) {
    //   var i = <UsableModel>item;
    //   return i.use(this.character).then(() => {
    //     this.notify.show("Used " + i.get('name') + " on " + this.character.get('name'), null, 0);
    //     this.model.removeInventory(item);
    //   });
    // }
    // this.model.removeInventory(item);
    // powAlert.show("Equipped " + item.attributes.name + " to " + hero.attributes.name);
  }

  unequipItem(item: Item) {
    console.warn('entity-inventory: implement unequip');
    // var hero: HeroModel = this.character;
    // if (!this.model.inventory || !item || !hero) {
    //   return;
    // }
    // if (item instanceof ArmorModel) {
    //   hero.unequipArmor(item);
    // }
    // else if (item instanceof WeaponModel) {
    //   var weapon: WeaponModel = <WeaponModel>item;
    //   if (weapon.isNoWeapon()) {
    //     return;
    //   }
    //   hero.weapon = null;
    // }
    // this.model.addInventory(item);
    // powAlert.show("Unequipped " + item.attributes.name + " from " + hero.attributes.name);
  }

}

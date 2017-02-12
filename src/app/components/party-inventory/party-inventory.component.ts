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
import {RPGGame} from '../../services/rpgGame';
import {NotificationService} from '../notification/notification.service';
import {GameState} from '../../models/game-state/game-state.model';
import {PartyMember} from '../../models/entity/entity.model';
import {Item} from '../../models/item/item.model';

@Component({
  selector: 'party-inventory',
  templateUrl: 'party-inventory.component.html'
})
export class PartyInventoryComponent {
  @Input()
  currentIndex: number = 0;
  @Input()
  character: PartyMember;
  @Input()
  model: GameState = null; // TODO: remove this dep
  @Input()
  active: boolean = false;

  constructor(public game: RPGGame, public notify: NotificationService) {
    this.character = this.model.party[this.currentIndex];
  }

  nextCharacter() {
    this.currentIndex++;
    if (this.currentIndex >= this.model.party.length) {
      this.currentIndex = 0;
    }
    this.character = this.model.party[this.currentIndex];
  }

  previousCharacter() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.model.party.length - 1;
    }
    this.character = this.model.party[this.currentIndex];
  }

  equipItem(item: Item) {
    console.warn('entity-inventory: implement equip');
    // var hero: PartyMember = this.character;
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

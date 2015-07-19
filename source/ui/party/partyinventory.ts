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

import {Component,View, NgIf, NgFor} from 'angular2/angular2';

import {ItemModel} from '../../models/itemModel';
import {WeaponModel} from '../../models/weaponModel';
import {ArmorModel} from '../../models/armorModel';
import {HeroModel} from '../../models/heroModel';
import {UsableModel} from '../../models/usableModel';
import {GameStateModel} from '../../models/gameStateModel';
import {RPGGame} from '../services/rpggame';
import {RPGSprite,RPGHealthBar} from '../rpg/all';
import {Notify} from '../services/notify';

@Component({
  selector: 'party-inventory',
  properties: ['model', 'character', 'currentIndex', 'game', 'active']
})
@View({
  templateUrl: 'source/ui/party/partyinventory.html',
  directives: [NgIf, NgFor, RPGSprite, RPGHealthBar]
})
export class PartyInventory {
  currentIndex:number = 0;
  character:HeroModel;
  model:GameStateModel;
  active:boolean = false;

  constructor(public game:RPGGame, public notify:Notify) {
    this.model = game.world.model;
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

  equipItem(item:ItemModel) {
    var hero:HeroModel = this.character;
    if (!this.model.inventory || !item || !hero) {
      return;
    }

    var users = item.get('usedby');
    if (users && _.indexOf(users, hero.get('type')) === -1) {
      this.notify.show(hero.get('name') + " cannot equip this item");
      return;
    }

    if (item instanceof ArmorModel) {
      var old:ArmorModel = hero.equipArmor(item);
      if (old) {
        this.model.addInventory(old);
      }
    }
    else if (item instanceof WeaponModel) {
      // Remove any existing weapon first
      if (hero.weapon) {
        this.model.addInventory(hero.weapon);
      }
      hero.weapon = <WeaponModel>item;
    }
    else if (item instanceof UsableModel) {
      var i = <UsableModel>item;
      return i.use(this.character).then(()=> {
        this.notify.show("Used " + i.get('name') + " on " + this.character.get('name'), null, 0);
        this.model.removeInventory(item);
      });
    }
    this.model.removeInventory(item);
    //powAlert.show("Equipped " + item.attributes.name + " to " + hero.attributes.name);
  }

  unequipItem(item:ItemModel) {
    var hero:HeroModel = this.character;
    if (!this.model.inventory || !item || !hero) {
      return;
    }
    if (item instanceof ArmorModel) {
      hero.unequipArmor(item);
    }
    else if (item instanceof WeaponModel) {
      var weapon:WeaponModel = <WeaponModel>item;
      if (weapon.isNoWeapon()) {
        return;
      }
      hero.weapon = null;
    }
    this.model.addInventory(item);
    //powAlert.show("Unequipped " + item.attributes.name + " from " + hero.attributes.name);
  }

}

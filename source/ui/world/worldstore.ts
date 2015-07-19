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

import * as rpg from '../../game';

import {Component, View, NgFor, NgIf, onDestroy} from 'angular2/angular2';
import {GameFeatureObject} from '../../objects/gameFeatureObject';
import {RPGSprite} from '../rpg/all';

import {RPGGame,Notify} from '../services/all';
import {StoreFeatureComponent} from '../../components/features/storeFeatureComponent';

import {GameStateModel} from '../../models/gameStateModel';
import {ItemModel,WeaponModel,ArmorModel, UsableModel} from '../../models/all';

@Component({
  selector: 'world-store',
  properties: ['selected', 'inventory', 'name', 'buyer'],
  lifecycle: [onDestroy]
})
@View({
  templateUrl: 'source/ui/world/worldstore.html',
  directives: [NgFor, NgIf, RPGSprite]
})
export class WorldStore {
  active:boolean = false;
  name:string = 'Invalid Store';
  buyer:GameStateModel;
  inventory:rpg.IGameItem[] = [];

  constructor(public game:RPGGame, public notify:Notify) {
    this.buyer = game.world.model;
    this.gameModel = game.world.model;
    game.world.scene.on('store:entered', (feature:StoreFeatureComponent) => {
      this.active = true;
      this.initStoreFromFeature(feature);
    }, this);
    game.world.scene.on('store:exited', () => {
      this.active = false;
    }, this);
  }

  onDestroy() {
    this.game.world.scene.off('store:entered', null, this);
    this.game.world.scene.off('store:exited', null, this);
    this.close();
  }

  /**
   * The game state model to modify.
   */
  gameModel:GameStateModel = null;

  /**
   * The selected item to purchase/sell.
   */
  selected:ItemModel = null;

  /**
   * Determine if the UI is in a selling state.
   */
  selling:boolean = false;


  initStoreFromFeature(feature:StoreFeatureComponent) {
    // Get enemies data from spreadsheet
    GameStateModel.getDataSource((data:pow2.GameDataResource) => {

      var hasCategory:boolean = typeof feature.host.category !== 'undefined';
      var theChoices:any[] = [];
      if (!hasCategory || feature.host.category === 'weapons') {
        theChoices = theChoices.concat(data.getSheetData('weapons'));
      }
      if (!hasCategory || feature.host.category === 'armor') {
        theChoices = theChoices.concat(data.getSheetData('armor'));
      }
      if (!hasCategory || feature.host.category === 'items') {
        theChoices = theChoices.concat(data.getSheetData('items'));
      }
      var items:rpg.IGameItem[] = [];
      _.each(feature.host.groups, (group:string)=> {
        items = items.concat(_.filter(theChoices, (c:any)=> {
          // Include items with no "groups" value or items with matching groups.
          return !c.groups || _.indexOf(c.groups, group) !== -1;
        }));
      });

      this.name = feature.name;
      this.inventory = <rpg.IGameItem[]>_.map(_.where(items, {
        level: feature.host.feature.level
      }),(i:any) => _.extend({},i));
    });
  }

  close() {
    this.active = false;
    this.selling = false;
    this.selected = null;
  }

  actionItem(item:any) {
    if (!item) {
      return;
    }

    var model:GameStateModel = this.game.world.model;
    var value:number = parseInt(item.cost);
    if (this.selling) {
      var itemIndex:number = -1;
      for (var i = 0; i < model.inventory.length; i++) {
        if (model.inventory[i].id === item.id) {
          itemIndex = i;
          break;
        }
      }
      if (itemIndex !== -1) {
        model.gold += value;
        this.notify.show("Sold " + item.name + " for " + item.cost + " gold.", null, 1500);
        model.inventory.splice(itemIndex, 1);
      }
    }
    else {
      if (value > model.gold) {
        this.notify.show("You don't have enough money");
        return;
      }
      else {
        model.gold -= value;
        this.notify.show("Purchased " + item.name + ".", null, 1500);
        var instanceModel = this.game.world.itemModelFromId(item.id);
        if(!instanceModel){
          throw new Error("Tried (and failed) to create item from invalid id: '" + item.id + "'.  Make sure ID is present in game data source");
        }
        model.inventory.push(instanceModel);
      }
    }

    this.selected = null;
    this.selling = false;

  }

  getActionVerb():string {
    return this.selling ? "Sell" : "Buy";
  }

  isBuying():boolean {
    return !this.selected && !this.selling;
  }

  isSelling():boolean {
    return !this.selected && this.selling;
  }

  toggleAction() {
    if (!this.selling) {
      if (this.gameModel.inventory.length === 0) {
        this.notify.show("You don't have any unequipped inventory to sell.", null, 1500);
        this.selling = false;
        return;
      }
    }
    this.selling = !this.selling;
  }

  selectItem(item:any) {
    if (item instanceof ItemModel) {
      item = item.toJSON();
    }
    this.selected = item;
  }

}

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

import * as rpg from '../game';
import {HeroModel,WeaponModel,ArmorModel,ItemModel,EntityModel,UsableModel} from './all';
import {GameWorld} from '../gameWorld';

var _gameData:pow2.GameDataResource = null;

export class GameStateModel extends pow2.Events implements pow2.IWorldObject {
  world:GameWorld;
  party:HeroModel[]; // The player's party
  inventory:ItemModel[]; // The inventory of items owned by the player.
  loader:pow2.ResourceLoader;
  keyData:{
    [key:string]:any
  } = {};
  gold:number;
  combatZone:string;

  constructor(options?:any) {
    super();
    _.defaults(this, options || {}, {
      gold: 200,
      playerPosition: new pow2.Point(),
      playerMap: "",
      combatZone: "world-plains",
      party: [],
      inventory: []
    });
  }

  initData(then?:(data:pow2.GameDataResource)=>any) {
    GameStateModel.getDataSource(then);
  }

  /**
   * Get the game data sheets from google and callback when they're loaded.
   * @param then The function to call when spreadsheet data has been fetched
   */
  static getDataSource(then?:(data:pow2.GameDataResource)=>any):pow2.GameDataResource {
    if (_gameData) {
      then && then(_gameData);
      return _gameData;
    }
    else {
      return <pow2.GameDataResource>pow2.ResourceLoader.get().loadAsType(pow2.SPREADSHEET_ID, pow2.GameDataResource, (resource:pow2.GameDataResource) => {
        _gameData = resource;
        then && then(resource);
      });
    }
  }

  setKeyData(key:string, data:any) {
    this.keyData[key] = data;
  }

  getKeyData(key:string):any {
    return this.keyData[key];
  }


  addInventory(item:ItemModel):ItemModel {
    this.inventory.push(item);
    return item;
  }

  // Remove an inventory item.  Return true if the item was removed, or false
  // if it was not found.
  removeInventory(item:ItemModel):boolean {
    for (var i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].cid === item.cid) {
        this.inventory.splice(i, 1);
        return true;
      }
    }
    return false;
  }


  addHero(model:HeroModel) {
    this.party.push(model);
    model.game = this;
  }

  addGold(amount:number) {
    this.gold += amount;
  }

  parse(data:any, options?:any) {
    if (!_gameData) {
      throw new Error("cannot instantiate inventory without valid data source.\nCall model.initData(loader) first.")
    }
    try {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    }
    catch (e) {
      console.log("Failed to load save game.");
      return;
    }
    if (typeof data.keyData !== 'undefined') {
      this.keyData = data.keyData;
    }
    this.inventory = _.map(data.inventory, (item:rpg.IGameItem) => {
      return this.world.itemModelFromId(item.id);
    });
    this.party = _.map(data.party, (partyMember:string) => {
      var model = new HeroModel();
      model.fromString(partyMember, this.world);
      return model;
    });
    _.extend(this, _.omit(data, 'party', 'inventory', 'keyData'));
  }

  toJSON() {
    var result:any = {
      gold: this.gold
    };
    result.party = _.map(this.party, (p) => {
      return p.toJSON ? p.toJSON() : p;
    });
    result.inventory = _.map(this.inventory, (p) => {
      return <any>p.attributes ? _.pick(p.attributes, 'id') : p.id;
    });
    try {
      result.keyData = this.keyData;
    }
    catch (e) {
      console.error("Failed to stringify keyData");
      result.keyData = {};
    }
    return result;
  }
}

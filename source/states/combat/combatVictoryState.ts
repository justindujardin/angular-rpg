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
import {CombatState} from './combatState';
import {CombatStateMachine} from './combatStateMachine';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {HeroModel,ItemModel} from '../../models/all';
import {PlayerMapState} from '../playerMapState';


export interface CombatVictorySummary {
  party:GameEntityObject[];
  enemies:GameEntityObject[];
  levels:HeroModel[];
  items?:ItemModel[];
  gold:number;
  exp:number;
  state:CombatVictoryState;
}

export class CombatVictoryState extends CombatState {
  static NAME:string = "Combat Victory";
  name:string = CombatVictoryState.NAME;

  enter(machine:CombatStateMachine) {
    super.enter(machine);

    var players:GameEntityObject[] = _.reject(machine.party, (p:GameEntityObject) => {
      return p.isDefeated();
    });
    if (players.length === 0) {
      throw new Error("Invalid state, cannot be in victory with no living party members");
    }

    var gold:number = 0;
    var exp:number = 0;
    var items:string[] = [];
    _.each(machine.enemies, (nme:GameEntityObject) => {
      gold += nme.model.get('gold') || 0;
      exp += nme.model.get('exp') || 0;
    });


    // Apply Fixed encounter bonus awards
    //
    if (machine.parent.encounterInfo.fixed) {
      var encounter = <rpg.IGameFixedEncounter>machine.parent.encounter;
      if (encounter.gold > 0) {
        gold += encounter.gold;
      }
      if (encounter.experience > 0) {
        exp += encounter.experience;
      }
      if (encounter.items && encounter.items.length > 0) {
        items = items.concat(encounter.items);
      }
    }

    // Award gold
    //
    machine.parent.model.addGold(gold);

    // Award items
    //
    var itemModels:ItemModel[] = [];
    items.forEach((i:string) => {
      var model = machine.parent.world.itemModelFromId(i);
      if (model) {
        itemModels.push(model);
        machine.parent.model.inventory.push(model);
      }
    });


    // Award experience
    //
    var expPerParty:number = Math.round(exp / players.length);
    var leveledHeros:HeroModel[] = [];
    _.each(players, (p:GameEntityObject) => {
      var heroModel = <HeroModel>p.model;
      var leveled:boolean = heroModel.awardExperience(expPerParty);
      if (leveled) {
        leveledHeros.push(heroModel);
      }
    });

    var summary:CombatVictorySummary = {
      state: this,
      party: machine.party,
      enemies: machine.enemies,
      levels: leveledHeros,
      items: itemModels,
      gold: gold,
      exp: exp
    };
    machine.notify("combat:victory", summary, ()=> {
      machine.parent.world.reportEncounterResult(true);
      machine.parent.setCurrentState(PlayerMapState.NAME);
    });
  }
}

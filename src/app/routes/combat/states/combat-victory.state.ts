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
import * as _ from 'underscore';
import {CombatMachineState} from './combat-base.state';
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {HeroModel} from '../../../../game/rpg/models/heroModel';
import {ItemModel} from '../../../../game/rpg/models/itemModel';
import {CombatStateMachine} from './combat.machine';
import {IGameFixedEncounter} from '../../../../game/rpg/game';
import {Combatant} from '../../../models/combat/combat.model';
import {Component} from '@angular/core';


export interface CombatVictorySummary {
  party: GameEntityObject[];
  enemies: GameEntityObject[];
  levels: HeroModel[];
  items?: ItemModel[];
  gold: number;
  exp: number;
  state: CombatVictoryState;
}

@Component({
  selector: 'combat-victory-state',
  template: `<ng-content></ng-content>`
})
export class CombatVictoryState extends CombatMachineState {
  static NAME: string = "Combat Victory";
  name: string = CombatVictoryState.NAME;

  enter(machine: CombatStateMachine) {
    super.enter(machine);

    var players: GameEntityObject[] = _.reject(machine.party, (p: GameEntityObject) => {
      return p.isDefeated();
    });
    if (players.length === 0) {
      throw new Error("Invalid state, cannot be in victory with no living party members");
    }

    let gold: number = 0;
    let exp: number = 0;
    let items: string[] = [];
    _.each(machine.enemies, (nme: GameEntityObject) => {
      const combatant = nme.model as Combatant;
      gold += combatant.gold || 0;
      exp += combatant.exp || 0;
    });


    // Apply Fixed encounter bonus awards
    //
    if (machine.parent.encounterInfo.fixed) {
      const encounter = <IGameFixedEncounter>machine.parent.encounter;
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
    machine.world.model.addGold(gold);

    // Award items
    //
    const itemModels: ItemModel[] = [];
    items.forEach((i: string) => {
      const model = machine.parent.world.itemModelFromId(i);
      if (model) {
        itemModels.push(model);
        machine.world.model.inventory.push(model);
      }
    });


    // Award experience
    //
    const expPerParty: number = Math.round(exp / players.length);
    const leveledHeros: HeroModel[] = [];
    _.each(players, (p: GameEntityObject) => {
      const heroModel = <HeroModel>p.model;
      const leveled: boolean = heroModel.awardExperience(expPerParty);
      if (leveled) {
        leveledHeros.push(heroModel);
      }
    });

    const summary: CombatVictorySummary = {
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
      // machine.parent.setCurrentState(PlayerMapState.NAME);
    });
  }
}

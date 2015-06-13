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

/// <reference path="../gameCombatStateMachine.ts" />


module rpg.states.combat {

  export interface CombatVictorySummary {
    party:GameEntityObject[];
    enemies:GameEntityObject[];
    levels:rpg.models.HeroModel[];
    gold:number;
    exp:number;
    state:CombatVictoryState;
  }

  export class CombatVictoryState extends CombatState {
    static NAME:string = "Combat Victory";
    name:string = CombatVictoryState.NAME;

    enter(machine:CombatStateMachine) {
      super.enter(machine);
      var gold:number = 0;
      var exp:number = 0;
      _.each(machine.enemies, (nme:GameEntityObject) => {
        gold += nme.model.get('gold') || 0;
        exp += nme.model.get('exp') || 0;
      });
      machine.parent.model.addGold(gold);

      var players:GameEntityObject[] = _.reject(machine.party, (p:GameEntityObject) => {
        return p.isDefeated();
      });
      var expPerParty:number = Math.round(exp / players.length);
      var leveledHeros:rpg.models.HeroModel[] = [];
      _.each(players, (p:GameEntityObject) => {
        var heroModel = <rpg.models.HeroModel>p.model;
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
        gold: gold,
        exp: exp
      };
      machine.notify("combat:victory", summary, ()=> {
        machine.parent.world.reportEncounterResult(true);
        machine.parent.setCurrentState(GameMapState.NAME);
      });
    }
  }
}
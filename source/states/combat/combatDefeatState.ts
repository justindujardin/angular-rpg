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

import {CombatState} from './combatState';
import {CombatStateMachine} from './combatStateMachine';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {PlayerDefaultState} from '../gameStateMachine';


export interface CombatDefeatSummary {
  party:GameEntityObject[];
  enemies:GameEntityObject[];
}

export class CombatDefeatState extends CombatState {
  static NAME:string = "Combat Defeat";
  name:string = CombatDefeatState.NAME;

  enter(machine:CombatStateMachine) {
    super.enter(machine);
    var data:CombatDefeatSummary = {
      enemies: machine.enemies,
      party: machine.party
    };
    machine.notify("combat:defeat", data, ()=> {
      machine.parent.world.reportEncounterResult(false);
      // TODO: This is a hack.  Need better game lifetime management.
      window.location.reload(true);
      machine.parent.setCurrentState(PlayerDefaultState.NAME);
    });
  }
}

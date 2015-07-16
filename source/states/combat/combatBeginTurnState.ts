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
import {IPlayerActionCallback,IPlayerAction} from '../playerCombatState';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {CombatAttackComponent} from '../../components/combat/actions/combatAttackComponent';

// Combat Begin
//--------------------------------------------------------------------------
export class CombatBeginTurnState extends CombatState {
  static NAME:string = "Combat Begin Turn";
  name:string = CombatBeginTurnState.NAME;
  current:GameEntityObject; // Used to restore scale on exit.
  machine:CombatStateMachine;

  enter(machine:CombatStateMachine) {
    super.enter(machine);
    this.machine = machine;
    machine.currentDone = false;
    machine.current.scale = 1.25;
    this.current = machine.current;

    if (machine.current && machine.isFriendlyTurn()) {
      machine.focus = machine.current;
    }

    machine.trigger("combat:beginTurn", machine.current);
    var choice:IPlayerAction = null;
    if (machine.isFriendlyTurn()) {
      console.log("TURN: " + machine.current.model.get('name'));
      choice = machine.playerChoices[machine.current._uid];
    }
    else {
      choice = <CombatAttackComponent>machine.current.findComponent(CombatAttackComponent);
      // TODO: This config should not be here.   Just pick a random person to attack.
      if (choice) {
        choice.to = machine.getRandomPartyMember();
        choice.from = machine.current;
      }
    }
    if (!choice) {
      throw new Error("Invalid Combat Action Choice. This should not happen.");
    }
    if (choice.to && choice.to.isDefeated()) {
      choice.to = machine.getRandomEnemy();
    }
    _.defer(()=> {
      choice.act((act:IPlayerAction, error?:any)=> {
        if (error) {
          console.error(error);
        }
      });
    });
  }

  exit(machine:CombatStateMachine) {
    this.current.scale = 1;
    super.exit(machine);
  }

}

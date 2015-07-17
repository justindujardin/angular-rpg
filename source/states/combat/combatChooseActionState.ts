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
import {CombatBeginTurnState} from './combatBeginTurnState';
import {CombatActionComponent} from '../../components/combat/actions/all';

export interface IChooseActionEvent {
  players:GameEntityObject[];
  enemies:GameEntityObject[];
  choose:(action:CombatActionComponent)=>any;
}

/**
 * Choose actions for all characters in the party.
 */
export class CombatChooseActionState extends CombatState {
  static NAME:string = "Combat Choose Actions";
  name:string = CombatChooseActionState.NAME;
  pending:GameEntityObject[] = [];

  enter(machine:CombatStateMachine) {
    super.enter(machine);

    machine.turnList = <GameEntityObject[]>_.shuffle(_.union(machine.getLiveParty(), machine.getLiveEnemies()));
    machine.current = machine.turnList.shift();
    machine.currentDone = true;

    this.pending = machine.getLiveParty();
    machine.playerChoices = {};

    // Trigger an event with a list of GameEntityObject party members to
    // choose an action for.   Provide a callback function that may be
    // invoked while handling the event to trigger status on the choosing
    // of moves.  Once data.choose(g,a) has been called for all party members
    // the state will transition to begin execution of player and enemy turns.
    machine.trigger("combat:chooseMoves", {
      choose: (action:CombatActionComponent)=> {
        machine.playerChoices[action.from._uid] = action;
        this.pending = _.filter(this.pending, (p:GameEntityObject)=> {
          return action.from._uid !== p._uid;
        });
        console.log(action.from.model.get('name') + " chose " + action.getActionName());
        if (this.pending.length === 0) {
          machine.setCurrentState(CombatBeginTurnState.NAME);
        }
      },
      players: this.pending,
      enemies: machine.getLiveEnemies()
    });
  }
}

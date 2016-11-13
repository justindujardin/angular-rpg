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
import {CombatMachineState} from './combat-base.state';
import {CombatStateMachine} from './combat.machine';
import {CombatBeginTurnState} from './combat-begin-turn.state';
import {CombatChooseActionState} from './combat-choose-action.state';
import {CombatDefeatState} from './combat-defeat.state';
import {CombatVictoryState} from './combat-victory.state';
import {Component} from '@angular/core';
import {isDefeated} from '../../../models/combat/combat.api';

@Component({
  selector: 'combat-end-turn-state',
  template: `<ng-content></ng-content>`
})
export class CombatEndTurnState extends CombatMachineState {
  static NAME: string = "Combat End Turn";
  name: string = CombatEndTurnState.NAME;

  enter(machine: CombatStateMachine) {
    super.enter(machine);
    machine.current = null;
    // Find the next turn.
    while (machine.turnList.length > 0 && !machine.current) {
      machine.current = machine.turnList.shift();
      // Strip out defeated players.
      if (machine.current && isDefeated(machine.current)) {
        machine.current = null;
      }
    }

    var targetState: string = machine.current ? CombatBeginTurnState.NAME : CombatChooseActionState.NAME;
    if (machine.partyDefeated()) {
      targetState = CombatDefeatState.NAME;
    }
    else if (machine.enemiesDefeated()) {
      targetState = CombatVictoryState.NAME;
    }
    if (!targetState) {
      throw new Error("Invalid transition from end turn");
    }
    machine.setCurrentState(targetState);
  }
}


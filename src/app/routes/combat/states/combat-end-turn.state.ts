/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import { Component } from '@angular/core';
import { CombatService } from '../../../models/combat/combat.service';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

@Component({
  selector: 'combat-end-turn-state',
  template: ` <ng-content></ng-content>`,
})
export class CombatEndTurnStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'end-turn';
  name: CombatStateNames = CombatEndTurnStateComponent.NAME;

  constructor(private combatService: CombatService) {
    super();
  }

  async enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    machine.current = null;
    // Find the next turn.
    while (machine.turnList.length > 0 && !machine.current) {
      machine.current = machine.turnList.shift() || null;
      // Strip out defeated players.
      if (machine.current && this.combatService.isDefeated(machine.current.model)) {
        machine.current = null;
      }
    }

    let targetState: CombatStateNames = machine.current
      ? 'begin-turn'
      : 'choose-action';
    if (machine.getLiveParty().length === 0) {
      targetState = 'defeat';
    } else if (machine.getLiveEnemies().length === 0) {
      targetState = 'victory';
    }
    if (!targetState) {
      throw new Error('Invalid transition from end turn');
    }
    await machine.setCurrentState(targetState);
  }
}

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
import {GameEntityObject} from '../../../scene/game-entity-object';
import {CombatStateMachineComponent} from './combat.machine';
import {Component} from '@angular/core';

/**
 * Describe the result of a combat run action.
 */
export interface CombatRunSummary {
  success: boolean;
  player: GameEntityObject;
}

@Component({
  selector: 'combat-escape-state',
  template: `<ng-content></ng-content>`
})
export class CombatEscapeStateComponent extends CombatMachineState {
  static NAME: string = 'Combat Escaped';
  name: string = CombatEscapeStateComponent.NAME;

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    machine.notify('combat:escape', {
      player: machine.current
    }, () => {
      alert('combat escape needs fixin\'');
      // machine.parent.world.reportEncounterResult(false);
      // machine.parent.setCurrentState(PlayerMapState.NAME);
    });
  }
}

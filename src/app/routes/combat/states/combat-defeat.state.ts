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
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

export interface CombatDefeatSummary {
  party: GameEntityObject[];
  enemies: GameEntityObject[];
}
@Component({
  selector: 'combat-defeat-state',
  template: `<ng-content></ng-content>`,
})
export class CombatDefeatStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'defeat';
  name: CombatStateNames = CombatDefeatStateComponent.NAME;

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    const data: CombatDefeatSummary = {
      enemies: machine.enemies.toArray(),
      party: machine.party.toArray(),
    };
    machine.notify('combat:defeat', data, () => {
      window.location.reload();
    });
  }
}

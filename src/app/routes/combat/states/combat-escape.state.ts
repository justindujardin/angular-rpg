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
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app/app.model';
import { CombatEscapeAction } from '../../../../app/models/combat/combat.actions';
import { GameEntityObject } from '../../../scene/game-entity-object';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

/**
 * Describe the result of a combat run action.
 */
export interface CombatRunSummary {
  success: boolean;
  player: GameEntityObject;
}

@Component({
  selector: 'combat-escape-state',
  template: `<ng-content></ng-content>`,
})
export class CombatEscapeStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'escape';
  name: CombatStateNames = CombatEscapeStateComponent.NAME;
  constructor(public store: Store<AppState>) {
    super();
  }
  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    machine.notify('combat:escape', { player: machine.current }, () => {
      this.store.dispatch(new CombatEscapeAction());
      // machine.parent.world.reportEncounterResult(false);
      // machine.parent.setCurrentState(PlayerMapState.NAME);
    });
  }
}

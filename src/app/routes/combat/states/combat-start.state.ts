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
import {CombatStateMachineComponent} from './combat.machine';
import {CombatChooseActionStateComponent} from './combat-choose-action.state';
import {Component} from '@angular/core';
import {NotificationService} from '../../../components/notification/notification.service';

// Combat Begin
@Component({
  selector: 'combat-start-state',
  template: `<ng-content></ng-content>`
})
export class CombatStartStateComponent extends CombatMachineState {
  static NAME: string = 'Combat Started';
  name: string = CombatStartStateComponent.NAME;

  constructor(private notify: NotificationService) {
    super();
  }

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    _.defer(() => {
      const encounter = machine.encounter;
      const _done = () => {
        machine.setCurrentState(CombatChooseActionStateComponent.NAME);
      };
      if (encounter && encounter.message) {
        // If the message contains pipe's, treat what is between each pipe as a separate
        // message to be displayed.
        let msgs = encounter.message.slice();
        const last = msgs.pop();
        msgs.forEach((m) => this.notify.show(m, null, 0));
        this.notify.show(last, _done, 0);
      }
      else {
        _done();
      }
    });
  }
}

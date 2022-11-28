import { Component } from '@angular/core';
import * as _ from 'underscore';
import { NotificationService } from '../../../components/notification/notification.service';
import { CombatMachineState } from './combat-base.state';
import { CombatChooseActionStateComponent } from './combat-choose-action.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

// Combat Begin
@Component({
  selector: 'combat-start-state',
  template: `<ng-content></ng-content>`,
})
export class CombatStartStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'start';
  name: CombatStateNames = CombatStartStateComponent.NAME;

  constructor(private notify: NotificationService) {
    super();
  }

  async enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    await new Promise<void>(async (resolve) => {
      const encounter = machine.encounter;
      const _done = () => {
        resolve();
        machine.setCurrentState(CombatChooseActionStateComponent.NAME);
      };
      if (encounter && encounter.message) {
        // If the message contains pipe's, treat what is between each pipe as a separate
        // message to be displayed.
        let msgs = encounter.message.slice();
        const last = msgs.last();
        const others = msgs.take(msgs.size - 1);
        others.forEach((m) => this.notify.show(m || '', undefined, 0));
        if (last) {
          this.notify.show(last, _done, 0);
          return;
        }
      }
      // Wait a short period before starting combat
      await new Promise<void>((next) => _.delay(() => next(), 750));
      _done();
    });
  }
}


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
    await super.enter(machine);
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
    // NOTE: don't await state changes in enter, or you'll deadlock
    machine.setCurrentState(targetState);
  }
}

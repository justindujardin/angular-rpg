
import { Component } from '@angular/core';
import { CombatService } from '../../../models/combat/combat.service';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { CombatAttackBehaviorComponent } from '../behaviors/actions/combat-attack.behavior';
import { IPlayerAction } from '../combat.types';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

// Combat Begin
@Component({
  selector: 'combat-begin-turn-state',
  template: ` <ng-content></ng-content>`,
})
export class CombatBeginTurnStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'begin-turn';
  name: CombatStateNames = CombatBeginTurnStateComponent.NAME;
  current: GameEntityObject; // Used to restore scale on exit.
  machine: CombatStateMachineComponent;

  constructor(private combatService: CombatService) {
    super();
  }

  async enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    this.machine = machine;
    machine.currentDone = false;
    assertTrue(machine.current, 'invalid current combat entity!');
    machine.current.scale = 1.25;
    this.current = machine.current;

    if (machine.current && machine.isFriendlyTurn()) {
      machine.focus = machine.current;
    }

    machine.onBeginTurn$.emit(machine.current);

    let choice: IPlayerAction | null = null;
    if (machine.isFriendlyTurn()) {
      console.log(`TURN: ${machine.current?.model?.name}`);
      choice = machine.playerChoices[machine.current._uid];
    } else {
      choice = machine.current.findBehavior<CombatAttackBehaviorComponent>(
        CombatAttackBehaviorComponent
      );
      // TODO: This config should not be here.   Just pick a random person to attack.
      if (choice) {
        choice.to = machine.getRandomPartyMember();
        choice.from = machine.current;
      }
    }
    assertTrue(choice, 'Invalid Combat Action Choice. This should not happen.');
    if (choice.to && this.combatService.isDefeated(choice.to.model)) {
      choice.to = machine.getRandomEnemy();
    }
    if (choice) {
      choice.act();
    }
  }

  async exit(machine: CombatStateMachineComponent) {
    this.current.scale = 1;
    super.exit(machine);
  }
}

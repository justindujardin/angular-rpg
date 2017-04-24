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
import {Component} from '@angular/core';
import {CombatMachineState} from './combat-base.state';
import {GameEntityObject} from '../../../scene/game-entity-object';
import {CombatStateMachineComponent, IPlayerAction} from './combat.machine';
import {CombatAttackBehaviorComponent} from '../behaviors/actions/combat-attack.behavior';
import {CombatService} from '../../../models/combat/combat.service';

// Combat Begin
@Component({
  selector: 'combat-begin-turn-state',
  template: `
    <ng-content></ng-content>`
})
export class CombatBeginTurnStateComponent extends CombatMachineState {
  static NAME: string = 'Combat Begin Turn';
  name: string = CombatBeginTurnStateComponent.NAME;
  current: GameEntityObject; // Used to restore scale on exit.
  machine: CombatStateMachineComponent;

  constructor(private combatService: CombatService) {
    super();
  }

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    this.machine = machine;
    machine.currentDone = false;
    machine.current.scale = 1.25;
    this.current = machine.current;

    if (machine.current && machine.isFriendlyTurn()) {
      machine.focus = machine.current;
    }

    machine.trigger('combat:beginTurn', machine.current);
    let choice: IPlayerAction = null;
    if (machine.isFriendlyTurn()) {
      console.log(`TURN: ${machine.current.model.name}`);
      choice = machine.playerChoices[machine.current._uid];
    }
    else {
      choice = machine.current.findBehavior(CombatAttackBehaviorComponent) as CombatAttackBehaviorComponent;
      // TODO: This config should not be here.   Just pick a random person to attack.
      if (choice) {
        choice.to = machine.getRandomPartyMember();
        choice.from = machine.current;
      }
    }
    if (!choice) {
      throw new Error('Invalid Combat Action Choice. This should not happen.');
    }
    if (choice.to && this.combatService.isDefeated(choice.to.model)) {
      choice.to = machine.getRandomEnemy();
    }
    _.defer(() => {
      choice.act((act: IPlayerAction, error?: any) => {
        if (error) {
          console.error(error);
        }
      });
    });
  }

  exit(machine: CombatStateMachineComponent) {
    this.current.scale = 1;
    super.exit(machine);
  }

}

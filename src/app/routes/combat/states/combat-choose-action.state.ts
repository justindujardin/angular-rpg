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
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {CombatMachineState} from './combat-base.state';
import {CombatStateMachine} from './combat.machine';
import {CombatBeginTurnState} from './combat-begin-turn.state';
import {CombatActionBehavior} from '../behaviors/combat-action.behavior';
import {ChooseActionType, ChooseActionStateMachine} from '../behaviors/choose-action.machine';
import {Point} from '../../../../game/pow-core/point';

export interface IChooseActionEvent {
  players: GameEntityObject[];
  enemies: GameEntityObject[];
  choose: (action: CombatActionBehavior)=>any;
}

/**
 * Describe a selectable menu item for a user input in combat.
 */
export interface ICombatMenuItem<T> {
  select(): any;
  label: string;
}

/**
 * Choose actions for all characters in the party.
 */
@Component({
  selector: 'combat-choose-action-state',
  template: `<ng-content></ng-content>`
})
export class CombatChooseActionState extends CombatMachineState {
  static NAME: string = "Combat Choose Actions";
  name: string = CombatChooseActionState.NAME;
  pending: GameEntityObject[] = [];

  machine: CombatStateMachine = null;


  /**
   * Available menu items for selection.
   */
  items: ICombatMenuItem<any>[] = [];

  enter(machine: CombatStateMachine) {
    super.enter(machine);
    if (!machine.scene) {
      throw new Error("Invalid Combat Scene");
    }
    this.machine = machine;


    machine.turnList = <GameEntityObject[]>_.shuffle(_.union(machine.getLiveParty(), machine.getLiveEnemies()));
    machine.current = machine.turnList.shift();
    machine.currentDone = true;

    this.pending = machine.getLiveParty();
    machine.playerChoices = {};

    // Trigger an event with a list of GameEntityObject party members to
    // choose an action for.   Provide a callback function that may be
    // invoked while handling the event to trigger status on the choosing
    // of moves.  Once data.choose(g,a) has been called for all party members
    // the state will transition to begin execution of player and enemy turns.
    const chooseData: IChooseActionEvent = {
      choose: (action: CombatActionBehavior) => {
        machine.playerChoices[action.from._uid] = action;
        this.pending = _.filter(this.pending, (p: GameEntityObject) => {
          return action.from._uid !== p._uid;
        });
        console.log(action.from.model.name + " chose " + action.getActionName());
        if (this.pending.length === 0) {
          machine.setCurrentState(CombatBeginTurnState.NAME);
        }
      },
      players: this.pending,
      enemies: machine.getLiveEnemies()
    };

    const choices: GameEntityObject[] = chooseData.players.slice();

    const next = () => {
      const p: GameEntityObject = choices.shift();
      if (!p) {
        return;
      }
      inputState.current = p;
      inputState.setCurrentState(ChooseActionType.NAME);
    };
    const chooseSubmit = (action: CombatActionBehavior) => {
      inputState.data.choose(action);
      next();
    };
    const inputState = new ChooseActionStateMachine(this, machine.scene, chooseData, chooseSubmit);
    next();

  }

  exit(machine: CombatStateMachine) {
    this.machine = null;
    return super.exit(machine);
  }


  setPointerTarget(object: GameEntityObject, directionClass: string = 'right', offset: Point = new Point()) {
    if (this.machine) {
      const pointer: HTMLElement = this.machine.pointer;
      pointer.classList.remove('left');
      pointer.classList.remove('right');
      pointer.classList.add(directionClass);
      this.machine.pointAt = object;
      this.machine.pointOffset = offset;
    }
  }

  addPointerClass(clazz: string) {
    if (this.machine) {
      this.machine.pointer.classList.add(clazz);
    }
  }

  removePointerClass(clazz: string) {
    if (this.machine) {
      this.machine.pointer.classList.remove(clazz);
    }
  }

  hidePointer() {
    if (this.machine) {
      this.machine.pointer.classList.add('hidden');
    }
  }

  showPointer() {
    if (this.machine) {
      this.machine.pointer.classList.remove('hidden');
    }
  }

}

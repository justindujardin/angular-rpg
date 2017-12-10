import * as _ from 'underscore';
import {CombatActionBehavior} from '../combat-action.behavior';
import {CombatEscapeStateComponent, CombatRunSummary} from '../../states/combat-escape.state';
import {CombatEndTurnStateComponent} from '../../states/combat-end-turn.state';
import {Component, Input} from '@angular/core';
import {IPlayerActionCallback} from '../../states/combat.machine';
import {CombatComponent} from '../../combat.component';

@Component({
  selector: 'combat-run-behavior',
  template: '<ng-content></ng-content>'
})
export class CombatRunBehaviorComponent extends CombatActionBehavior {
  name: string = 'run';
  @Input() combat: CombatComponent;

  canTarget(): boolean {
    return false;
  }

  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    let success: boolean = this._rollEscape();
    let data: CombatRunSummary = {
      success,
      player: this.combat.machine.current
    };
    this.combat.machine.notify('combat:run', data, () => {
      if (success) {
        this.combat.machine.setCurrentState(CombatEscapeStateComponent.NAME);
      }
      else {
        this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
      }
      if (then) {
        then(this);
      }
    });
    return true;
  }

  /**
   * Determine if a run action results in a successful escape from
   * combat.
   *
   * TODO: This should really consider character attributes.
   *
   * @returns {boolean} If the escape will succeed.
   * @private
   */
  private _rollEscape(): boolean {
    let roll: number = _.random(0, 200);
    let chance: number = 100;
    if (roll === 200) {
      return false;
    }
    if (roll === 0) {
      return true;
    }
    return roll <= chance;
  }

}

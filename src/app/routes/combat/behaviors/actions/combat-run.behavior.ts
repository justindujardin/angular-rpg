import { Component, Input } from '@angular/core';
import * as _ from 'underscore';
import { assertTrue } from '../../../../models/util';
import { CombatComponent } from '../../combat.component';
import { IPlayerActionCallback } from '../../combat.types';
import { CombatRunSummary } from '../../states/combat-escape.state';
import { CombatActionBehavior } from '../combat-action.behavior';

@Component({
  selector: 'combat-run-behavior',
  template: '<ng-content></ng-content>',
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
    const success: boolean = this._rollEscape();
    assertTrue(
      this.combat.machine.current,
      'CombatRunBehaviorComponent: invalid escape player'
    );
    const data: CombatRunSummary = {
      success,
      player: this.combat.machine.current,
    };
    this.combat.machine.onRun$.emit(data).then(() => {
      if (success) {
        this.combat.machine.setCurrentState('escape');
      } else {
        this.combat.machine.setCurrentState('end-turn');
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

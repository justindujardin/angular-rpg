import * as _ from 'underscore';
import {CombatActionBehavior} from '../combat-action.behavior';
import {IPlayerActionCallback} from '../../playerCombatState';
import {CombatRunSummary, CombatEscapeState} from '../../states/combat-escape.state';
import {CombatEndTurnState} from '../../states/combat-end-turn.state';
import {Component} from '@angular/core';

@Component({
  selector: 'combat-run-behavior',
  template: '<ng-content></ng-content>'
})
export class CombatRunBehavior extends CombatActionBehavior {
  name: string = "run";

  canTarget(): boolean {
    return false;
  }

  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    var success: boolean = this._rollEscape();
    var data: CombatRunSummary = {
      success: success,
      player: this.combat.machine.current
    };
    this.combat.machine.notify("combat:run", data, ()=> {
      if (success) {
        this.combat.machine.setCurrentState(CombatEscapeState.NAME);
      }
      else {
        this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
      }
      then && then(this);
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
    var roll: number = _.random(0, 200);
    var chance: number = 100;
    if (roll === 200) {
      return false;
    }
    if (roll === 0) {
      return true;
    }
    return roll <= chance;
  }

}

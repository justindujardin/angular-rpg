import * as _ from 'underscore';
import {IPlayerActionCallback} from '../../playerCombatState';
import {CombatEndTurnState} from '../../states/combat-end-turn.state';
import {CombatStateMachine} from '../../states/combat.machine';
import {HeroModel} from '../../../../../game/rpg/models/heroModel';
import {CombatChooseActionState} from '../../states/combat-choose-action.state';
import {CombatVictoryState} from '../../states/combat-victory.state';
import {CombatDefeatState} from '../../states/combat-defeat.state';
import {CombatEscapeState} from '../../states/combat-escape.state';
import {CombatMachineState} from '../../states/combat-base.state';
import {CombatActionBehavior} from '../combat-action.behavior';
import {Component} from '@angular/core';

@Component({
  selector: 'combat-guard-behavior',
  template: '<ng-content></ng-content>'
})
export class CombatGuardBehavior extends CombatActionBehavior {
  name: string = "guard";

  canTarget(): boolean {
    return false;
  }

  act(then?: IPlayerActionCallback): boolean {
    this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
    return super.act(then);
  }


  /**
   * Until the end of the next turn, or combat end, increase the
   * current players defense.
   */
  select() {
    this.combat.machine.on(CombatStateMachine.Events.ENTER, this.enterState, this);
    console.info("Adding guard defense buff to player: " + this.from.model.name);
    if (!(this.from.model instanceof HeroModel)) {
      throw new Error("This action is not currently applicable to non hero characters.");
    }
    var heroModel = this.from.model;
    var multiplier: number = heroModel.level < 10 ? 2 : 0.5;
    heroModel.defenseBuff += (heroModel.getDefense(true) * multiplier);
  }

  enterState(newState: CombatMachineState, oldState: CombatMachineState) {
    var exitStates: string[] = [
      CombatChooseActionState.NAME,
      CombatVictoryState.NAME,
      CombatDefeatState.NAME,
      CombatEscapeState.NAME
    ];
    if (_.indexOf(exitStates, newState.name) !== -1) {
      console.info("Removing guard defense buff from player: " + this.from.model.name);
      this.combat.machine.off(CombatStateMachine.Events.ENTER, this.enterState, this);
      var heroModel = <HeroModel>this.from.model;
      heroModel.defenseBuff = 0;
    }
  }
}

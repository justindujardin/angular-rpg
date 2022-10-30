import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'underscore';
import { AppState } from '../../../../app.model';
import { CombatantTypes } from '../../../../models/base-entity';
import {
  CombatClearStatusAction,
  CombatSetStatusAction,
} from '../../../../models/combat/combat.actions';
import { assertTrue } from '../../../../models/util';
import { CombatComponent } from '../../combat.component';
import { IPlayerActionCallback } from '../../combat.types';
import { CombatMachineState } from '../../states/combat-base.state';
import { CombatStateMachineComponent } from '../../states/combat.machine';
import { CombatStateNames } from '../../states/states';
import { CombatActionBehavior } from '../combat-action.behavior';

@Component({
  selector: 'combat-guard-behavior',
  template: '<ng-content></ng-content>',
})
export class CombatGuardBehavior extends CombatActionBehavior {
  name: string = 'guard';
  @Input() combat: CombatComponent;

  constructor(public store: Store<AppState>) {
    super();
  }

  canTarget(): boolean {
    return false;
  }

  act(then?: IPlayerActionCallback): boolean {
    this.combat.machine.setCurrentState('end-turn');
    return super.act(then);
  }

  /**
   * Until the end of the next turn, or combat end, increase the
   * current players defense.
   */
  select() {
    const model: CombatantTypes = this.from?.model as CombatantTypes;
    assertTrue(model, 'invalid guard behavior model');
    this.combat.machine.on(
      CombatStateMachineComponent.Events.ENTER,
      this.enterState,
      this
    );
    this.store.dispatch(
      new CombatSetStatusAction({ target: model, classes: ['guarding'] })
    );
  }

  enterState(newState: CombatMachineState, oldState: CombatMachineState) {
    const model: CombatantTypes = this.from?.model as CombatantTypes;
    assertTrue(model, 'invalid guard behavior model');
    var exitStates: CombatStateNames[] = [
      'choose-action',
      'victory',
      'defeat',
      'escape',
    ];
    if (_.indexOf(exitStates, newState.name) !== -1) {
      this.store.dispatch(
        new CombatClearStatusAction({ target: model, classes: ['guarding'] })
      );
      this.combat.machine.off(
        CombatStateMachineComponent.Events.ENTER,
        this.enterState,
        this
      );
    }
  }
}

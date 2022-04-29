import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'underscore';
import { AppState } from '../../../../app.model';
import {
  CombatClearStatusAction,
  CombatSetStatusAction,
} from '../../../../models/combat/combat.actions';
import { Entity } from '../../../../models/entity/entity.model';
import { CombatComponent } from '../../combat.component';
import { CombatMachineState } from '../../states/combat-base.state';
import {
  CombatStateMachineComponent,
  IPlayerActionCallback,
} from '../../states/combat.machine';
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
    this.combat.machine.on(
      CombatStateMachineComponent.Events.ENTER,
      this.enterState,
      this
    );
    const model = this.from.model as Entity;
    this.store.dispatch(
      new CombatSetStatusAction({ target: this.from.model, classes: ['guarding'] })
    );
  }

  enterState(newState: CombatMachineState, oldState: CombatMachineState) {
    var exitStates: CombatStateNames[] = [
      'choose-action',
      'victory',
      'defeat',
      'escape',
    ];
    if (_.indexOf(exitStates, newState.name) !== -1) {
      this.store.dispatch(
        new CombatClearStatusAction({ target: this.from.model, classes: ['guarding'] })
      );
      this.combat.machine.off(
        CombatStateMachineComponent.Events.ENTER,
        this.enterState,
        this
      );
    }
  }
}

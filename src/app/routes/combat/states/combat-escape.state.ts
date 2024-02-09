
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app/app.model';
import { CombatEscapeAction } from '../../../../app/models/combat/combat.actions';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

/**
 * Describe the result of a combat run action.
 */
export interface CombatRunSummary {
  player: GameEntityObject;
  success: boolean;
}

@Component({
  selector: 'combat-escape-state',
  template: `<ng-content></ng-content>`,
})
export class CombatEscapeStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'escape';
  name: CombatStateNames = CombatEscapeStateComponent.NAME;
  constructor(public store: Store<AppState>) {
    super();
  }
  async enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    this.store.dispatch(new CombatEscapeAction());
  }
}

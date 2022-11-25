import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from '../../../../app.model';
import { ResourceManager } from '../../../../core';
import { IStateChange } from '../../../../core/state-machine';
import { CombatantTypes } from '../../../../models/base-entity';
import {
  CombatClearStatusAction,
  CombatSetStatusAction,
} from '../../../../models/combat/combat.actions';
import { assertTrue } from '../../../../models/util';
import { GameWorld } from '../../../../services/game-world';
import { CombatComponent } from '../../combat.component';
import { CombatStateNames } from '../../states/states';
import { CombatActionBehavior } from '../combat-action.behavior';

@Component({
  selector: 'combat-guard-behavior',
  template: '<ng-content></ng-content>',
})
export class CombatGuardBehavior extends CombatActionBehavior {
  name: string = 'guard';
  @Input() combat: CombatComponent;

  /** The state change subscription */
  private _subscription: Subscription | null = null;
  private _changedModel: CombatantTypes | null = null;

  constructor(
    public store: Store<AppState>,
    protected loader: ResourceManager,
    protected gameWorld: GameWorld
  ) {
    super(loader, gameWorld);
  }

  canTarget(): boolean {
    return false;
  }

  /**
   * Until the end of the next turn, or combat end, increase the
   * current players defense.
   */
  async act(): Promise<boolean> {
    const model: CombatantTypes = this.from?.model as CombatantTypes;
    assertTrue(model, 'invalid guard behavior model');
    assertTrue(this._subscription === null, 'subscription leak in guard behavior');
    assertTrue(this._changedModel === null, 'changed model leak in guard behavior');
    this._subscription = this.combat.machine.onEnterState$.subscribe((v) =>
      this.enterStateHandler(v)
    );
    this.store.dispatch(
      new CombatSetStatusAction({ target: model, classes: ['guarding'] })
    );
    this.combat.machine.setCurrentState('end-turn');
    return true;
  }

  enterStateHandler(change: IStateChange<CombatStateNames>) {
    const { to } = change;
    const exitStates: CombatStateNames[] = [
      'choose-action',
      'victory',
      'defeat',
      'escape',
    ];
    if (exitStates.includes(to.name)) {
      const model: CombatantTypes = this.from?.model as CombatantTypes;
      assertTrue(model, 'invalid guard behavior model');
      this.store.dispatch(
        new CombatClearStatusAction({
          target: model,
          classes: ['guarding'],
        })
      );
      this._changedModel = null;
      assertTrue(this._subscription, 'unmatched subscription in guard behavior');
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }
}

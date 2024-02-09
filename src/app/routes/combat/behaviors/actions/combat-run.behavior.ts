import { Component, Input } from '@angular/core';
import * as _ from 'underscore';
import { ResourceManager } from '../../../../core';
import { assertTrue } from '../../../../models/util';
import { GameWorld } from '../../../../services/game-world';
import { CombatComponent } from '../../combat.component';
import { CombatRunSummary } from '../../states/combat-escape.state';
import { CombatActionBehavior } from '../combat-action.behavior';

@Component({
  selector: 'combat-run-behavior',
  template: '<ng-content></ng-content>',
})
export class CombatRunBehaviorComponent extends CombatActionBehavior {
  name: string = 'run';
  @Input() combat: CombatComponent;

  constructor(
    protected loader: ResourceManager,
    protected gameWorld: GameWorld,
  ) {
    super(loader, gameWorld);
  }

  canTarget(): boolean {
    return false;
  }

  async act(): Promise<boolean> {
    const success: boolean = this.rollEscape();
    assertTrue(
      this.combat.machine.current,
      'CombatRunBehaviorComponent: invalid escape player',
    );
    const data: CombatRunSummary = {
      success,
      player: this.combat.machine.current,
    };
    await this.combat.machine.onRun$.emit(data);
    if (success) {
      this.combat.machine.setCurrentState('escape');
    } else {
      this.combat.machine.setCurrentState('end-turn');
    }
    return true;
  }

  /**
   * Determine if a run action results in a successful escape from
   * combat.
   *
   * TODO: This should really consider character attributes.
   *
   * @returns If the escape will succeed.
   */
  rollEscape(): boolean {
    let roll: number = _.random(0, 200);
    let chance: number = 120;
    return roll <= chance;
  }
}

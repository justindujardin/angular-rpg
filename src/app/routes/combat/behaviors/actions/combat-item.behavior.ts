import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { CombatPlayerRenderBehaviorComponent } from '..';
import { AppState } from '../../../../app.model';
import { AnimatedSpriteBehavior } from '../../../../behaviors/animated-sprite.behavior';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { SpriteComponent } from '../../../../behaviors/sprite.behavior';
import { CombatAttackAction } from '../../../../models/combat/combat.actions';
import { CombatAttack } from '../../../../models/combat/combat.model';
import { GameStateRemoveInventoryAction } from '../../../../models/game-state/game-state.actions';
import { GameEntityObject } from '../../../../scene/game-entity-object';
import { CombatComponent } from '../../combat.component';
import { CombatEndTurnStateComponent } from '../../states/combat-end-turn.state';
import { IPlayerActionCallback } from '../../states/combat.machine';
import { CombatActionBehavior } from '../combat-action.behavior';

/**
 * Use an item in combat
 */
@Component({
  selector: 'combat-item-behavior',
  template: '<ng-content></ng-content>',
})
export class CombatItemBehavior extends CombatActionBehavior {
  name: string = 'item';
  @Input() combat: CombatComponent;

  constructor(public store: Store<AppState>) {
    super();
  }
  canBeUsedBy(entity: GameEntityObject): boolean {
    if (!super.canBeUsedBy(entity)) {
      return false;
    }
    return this.combat.machine.items.size > 0;
  }

  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    var done = (error?: any): any => {
      then && then(this, error);
      this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
    };
    if (!this.item) {
      return done();
    }
    return this.useItem(done);
  }

  useItem(done?: (error?: any) => any) {
    //
    var user: GameEntityObject = this.from;
    var target: GameEntityObject = this.to;
    var userRender = user.findBehavior(
      CombatPlayerRenderBehaviorComponent
    ) as CombatPlayerRenderBehaviorComponent;

    userRender.magic(() => {
      // TODO: We need some kind of effects registry and a way to specify which
      //       effects and their parameters each item should impart. For now this
      //       treats every item like a health potion that restores 30 hp. {^_^}
      console.warn('Item effects need love! <3 Search this string for more info.');
      var healAmount: number = -30;
      const healData: CombatAttack = {
        attacker: user.model,
        defender: target.model,
        damage: healAmount,
      };
      this.store.dispatch(new CombatAttackAction(healData));
      this.store.dispatch(new GameStateRemoveInventoryAction(this.item));
      var hitSound: string = 'sounds/heal';
      var behaviors = {
        animation: new AnimatedSpriteBehavior({
          spriteName: 'heal',
          lengthMS: 550,
        }),
        sprite: new SpriteComponent({
          name: 'heal',
          icon: 'animSpellCast.png',
        }),
        sound: new SoundBehavior({
          url: hitSound,
          volume: 0.3,
        }),
      };
      target.addComponentDictionary(behaviors);
      behaviors.animation.once('animation:done', () => {
        target.removeComponentDictionary(behaviors);
        done();
      });
    });
    return true;
  }
}

import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.model';
import { AnimatedSpriteBehavior } from '../../../../behaviors/animated-sprite.behavior';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { SpriteComponent } from '../../../../behaviors/sprite.behavior';
import { CombatAttackAction } from '../../../../models/combat/combat.actions';
import { CombatAttack } from '../../../../models/combat/combat.model';
import { GameStateRemoveInventoryAction } from '../../../../models/game-state/game-state.actions';
import { assertTrue } from '../../../../models/util';
import { GameEntityObject } from '../../../../scene/objects/game-entity-object';
import { CombatPlayerComponent } from '../../combat-player.component';
import { CombatComponent } from '../../combat.component';
import { IPlayerActionCallback } from '../../combat.types';
import { CombatEndTurnStateComponent } from '../../states/combat-end-turn.state';
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
    const user: GameEntityObject = this.from as GameEntityObject;
    const target: GameEntityObject = this.to as GameEntityObject;
    assertTrue(user, 'invalid item user');
    assertTrue(target, 'invalid item target');
    const userModel = user.model;
    const targetModel = target.model;
    const item = this.item;
    assertTrue(userModel, 'invalid item user model');
    assertTrue(targetModel, 'invalid item target model');
    assertTrue(item, 'invalid item target model');
    const userRender = user as CombatPlayerComponent;
    assertTrue(userRender, 'item user has no render behavior');
    userRender.magic(() => {
      // TODO: We need some kind of effects registry and a way to specify which
      //       effects and their parameters each item should impart. For now this
      //       treats every item like a health potion that restores 30 hp. {^_^}
      console.warn('Item effects need love! <3 Search this string for more info.');
      var healAmount: number = -30;
      const healData: CombatAttack = {
        attacker: userModel,
        defender: targetModel,
        damage: healAmount,
      };
      this.store.dispatch(new CombatAttackAction(healData));
      this.store.dispatch(new GameStateRemoveInventoryAction(item));
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
      const sub = behaviors.animation.onDone$.subscribe(() => {
        sub?.unsubscribe();
        target.removeComponentDictionary(behaviors);
        if (done) {
          done();
        }
      });
    });
    return true;
  }
}

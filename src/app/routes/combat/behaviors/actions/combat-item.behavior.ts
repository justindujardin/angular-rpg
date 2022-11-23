import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { AppState } from '../../../../app.model';
import { AnimatedSpriteBehavior } from '../../../../behaviors/animated-sprite.behavior';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { SpriteComponent } from '../../../../behaviors/sprite.behavior';
import { ResourceManager } from '../../../../core';
import { CombatAttackAction } from '../../../../models/combat/combat.actions';
import { CombatAttack } from '../../../../models/combat/combat.model';
import { GameStateRemoveInventoryAction } from '../../../../models/game-state/game-state.actions';
import { assertTrue } from '../../../../models/util';
import { GameEntityObject } from '../../../../scene/objects/game-entity-object';
import { GameWorld } from '../../../../services/game-world';
import { CombatPlayerComponent } from '../../combat-player.component';
import { CombatComponent } from '../../combat.component';
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

  constructor(
    public store: Store<AppState>,
    protected loader: ResourceManager,
    protected gameWorld: GameWorld
  ) {
    super(loader, gameWorld);
  }
  canBeUsedBy(entity: GameEntityObject): boolean {
    if (!super.canBeUsedBy(entity)) {
      return false;
    }
    return this.combat.machine.items.size > 0;
  }

  async act(): Promise<boolean> {
    if (this.item) {
      await this.useItem();
    }
    this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
    return true;
  }

  async useItem() {
    //
    const user: GameEntityObject = this.from as GameEntityObject;
    assertTrue(user, 'invalid item user');
    const userRender = user as CombatPlayerComponent;
    assertTrue(userRender, 'item user has no render behavior');
    // TODO: We need some kind of effects registry and a way to specify which
    await userRender.magic(() => this._useItem());
    return true;
  }

  private async _useItem() {
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
    await behaviors.animation.onDone$.pipe(take(1)).toPromise();
    target.removeComponentDictionary(behaviors);
  }
}

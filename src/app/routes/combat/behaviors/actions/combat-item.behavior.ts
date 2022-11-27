import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { AppState } from '../../../../app.model';
import { AnimatedSpriteBehavior } from '../../../../behaviors/animated-sprite.behavior';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { SpriteComponent } from '../../../../behaviors/sprite.behavior';
import { ResourceManager } from '../../../../core';
import { getSoundEffectUrl } from '../../../../core/api';
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

  sounds = {
    healSound: getSoundEffectUrl('heal'),
  };
  sprites = {
    useItem: 'animSpellCast.png',
  };

  constructor(
    public store: Store<AppState>,
    protected loader: ResourceManager,
    protected gameWorld: GameWorld
  ) {
    super(loader, gameWorld);
  }
  canBeUsedBy(entity: GameEntityObject): boolean {
    return this.combat.machine.items.size > 0;
  }

  async act(): Promise<boolean> {
    const user: CombatPlayerComponent = this.from as CombatPlayerComponent;
    assertTrue(user instanceof CombatPlayerComponent, 'invalid item user');
    await user.magic(() => this._useItem());
    this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
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
    assertTrue(item.effects, 'item with no valid effects');
    const [effectName, effectValue] = item.effects;
    switch (effectName) {
      case 'heal':
        const healData: CombatAttack = {
          attacker: userModel,
          defender: targetModel,
          damage: -effectValue,
        };
        this.store.dispatch(new CombatAttackAction(healData));
        break;
    }
    this.store.dispatch(new GameStateRemoveInventoryAction(item));
    var behaviors = {
      animation: new AnimatedSpriteBehavior({
        spriteName: 'heal',
        lengthMS: 550,
      }),
      sprite: new SpriteComponent({
        name: 'heal',
        icon: this.sprites.useItem,
      }),
      sound: new SoundBehavior({
        url: this.sounds.healSound,
        volume: 0.3,
      }),
    };
    target.addComponentDictionary(behaviors);
    await behaviors.animation.onDone$.pipe(take(1)).toPromise();
    target.removeComponentDictionary(behaviors);
  }
}

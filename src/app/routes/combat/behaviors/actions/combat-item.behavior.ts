import { Component, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AppState } from '../../../../app.model';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { AnimatedComponent } from '../../../../components';
import { Point, ResourceManager } from '../../../../core';
import { getSoundEffectUrl } from '../../../../core/api';
import { CombatAttackAction } from '../../../../models/combat/combat.actions';
import { CombatAttack } from '../../../../models/combat/combat.model';
import { GameStateRemoveInventoryAction } from '../../../../models/game-state/game-state.actions';
import { assertTrue } from '../../../../models/util';
import { GameEntityObject } from '../../../../scene/objects/game-entity-object';
import { GameFeatureObject } from '../../../../scene/objects/game-feature-object';
import { GameWorld } from '../../../../services/game-world';
import { CombatPlayerComponent } from '../../combat-player.component';
import { CombatComponent } from '../../combat.component';
import { CombatAttackSummary } from '../../combat.types';
import { CombatEndTurnStateComponent } from '../../states/combat-end-turn.state';
import { CombatActionBehavior } from '../combat-action.behavior';

/**
 * Use an item in combat
 */
@Component({
  selector: 'combat-item-behavior',
  template: '<animated></animated><ng-content></ng-content>',
})
export class CombatItemBehavior extends CombatActionBehavior {
  name: string = 'item';
  @Input() combat: CombatComponent;

  @ViewChild(AnimatedComponent) animation: AnimatedComponent;

  sounds = {
    healSound: getSoundEffectUrl('heal'),
  };
  sprites = {
    useItem: 'animSpellCast.png',
  };

  constructor(
    public store: Store<AppState>,
    protected loader: ResourceManager,
    protected gameWorld: GameWorld,
  ) {
    super(loader, gameWorld);
  }

  ngAfterViewInit(): void {
    this.combat.scene.addObject(this.animation);
  }

  ngOnDestroy(): void {
    this.combat?.scene?.removeObject(this.animation);
  }

  canBeUsedBy(entity: GameEntityObject): boolean {
    return this.combat.machine.items.size > 0;
  }

  async act(): Promise<boolean> {
    const user: CombatPlayerComponent = this.from as CombatPlayerComponent;
    assertTrue(user instanceof CombatPlayerComponent, 'invalid item user');
    const done$ = new BehaviorSubject<boolean>(false);
    const actionCompletePromise = done$
      .pipe(
        filter((d) => d === true),
        take(1),
      )
      .toPromise();

    await user.magic(async () => {
      await this._useItem();
      done$.next(true);
    });
    await actionCompletePromise;
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
    const data: CombatAttackSummary = {
      damage: -effectValue,
      attacker: user,
      defender: target,
    };
    switch (effectName) {
      case 'heal':
        const healData: CombatAttack = {
          attacker: userModel,
          defender: targetModel,
          damage: -effectValue,
        };
        this.store.dispatch(new CombatAttackAction(healData));
    }
    this.store.dispatch(new GameStateRemoveInventoryAction(item));
    var behaviors = {
      sound: new SoundBehavior({
        url: this.sounds.healSound,
        volume: 0.3,
      }),
    };
    target.addComponentDictionary(behaviors);
    const itemObject = new GameFeatureObject();
    await itemObject.setSprite(item.icon);
    itemObject.point = user.point.clone().add(0, -0.5);
    this.combat.scene.addObject(itemObject);
    const emitDone = this.combat.machine.onAttack$.emit(data);
    if (this.animation) {
      await this.animation.playChain([
        {
          name: 'Use Item',
          repeats: 0,
          duration: 1000,
          move: new Point(0, -0.5),
          host: itemObject,
        },
      ]);
    }
    this.combat.scene.removeObject(itemObject);
    await behaviors.sound.onDone$.pipe(take(1)).toPromise();
    target.removeComponentDictionary(behaviors);
    await emitDone;
  }
}

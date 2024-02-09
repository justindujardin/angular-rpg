import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, first, take } from 'rxjs/operators';
import * as _ from 'underscore';
import { AppState } from '../../../../app.model';
import { AnimatedSpriteBehavior } from '../../../../behaviors/animated-sprite.behavior';
import { DamageComponent } from '../../../../behaviors/damage.behavior';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { SpriteComponent } from '../../../../behaviors/sprite.behavior';
import { ResourceManager } from '../../../../core';
import { getSoundEffectUrl } from '../../../../core/api';
import { CombatantTypes } from '../../../../models/base-entity';
import { CombatAttackAction } from '../../../../models/combat/combat.actions';
import { CombatAttack } from '../../../../models/combat/combat.model';
import { CombatService } from '../../../../models/combat/combat.service';
import { EntityWithEquipment } from '../../../../models/entity/entity.model';
import { getCombatEntityEquipment } from '../../../../models/selectors';
import { assertTrue } from '../../../../models/util';
import { GameEntityObject } from '../../../../scene/objects/game-entity-object';
import { GameWorld } from '../../../../services/game-world';
import { CombatPlayerComponent } from '../../combat-player.component';
import { CombatComponent } from '../../combat.component';
import { CombatAttackSummary } from '../../combat.types';
import { CombatActionBehavior } from '../combat-action.behavior';

/**
 * Attack another entity in combat.
 */
@Component({
  selector: 'combat-attack-behavior',
  template: '<ng-content></ng-content>',
})
export class CombatAttackBehaviorComponent extends CombatActionBehavior {
  name: string = 'attack';

  sounds = {
    killSound: getSoundEffectUrl('killed'),
    missSound: getSoundEffectUrl('miss'),
    hitSound: getSoundEffectUrl('hit'),
  };
  sprites = {
    hit: 'animHit.png',
    doubleHit: 'animSlash.png',
    guardHit: 'animSmoke.png',
    missHit: 'animMiss.png',
  };

  @Input() combat: CombatComponent;

  constructor(
    private store: Store<AppState>,
    private combatService: CombatService,
    protected gameWorld: GameWorld,
    protected loader: ResourceManager,
  ) {
    super(loader, gameWorld);
  }

  /**
   * Determine the sound effect to play for attacks when they land.
   * @param currentHP The current HP of the entity being attacked
   * @param damage The amount of damage being done
   * @param guarding Whether the entity being attacked is guarding
   * @returns The sound effect URL to play
   */
  getHitSound(currentHP: number, damage: number, guarding: boolean = false) {
    const didKill: boolean = currentHP - damage <= 0;
    const hit: boolean = damage > 0;
    let hitSound = this.sounds.hitSound;
    if (didKill) {
      hitSound = this.sounds.killSound;
    } else if (hit) {
      if (guarding) {
        hitSound = this.sounds.missSound;
      } else {
        hitSound = this.sounds.hitSound;
      }
    } else {
      hitSound = this.sounds.missSound;
    }
    return hitSound;
  }

  /**
   * Get the sprite animation name to use for damage being applied to a target
   * @param damage The damage being applied
   * @param guarding Whether the target of the damage is guarding
   */
  getDamageAnimation(damage: number, numHits: number = 1, guarding: boolean = false) {
    const hit: boolean = damage > 0;
    const hitAnim = numHits > 1 ? this.sprites.doubleHit : this.sprites.hit;
    return hit ? (guarding ? this.sprites.guardHit : hitAnim) : this.sprites.missHit;
  }

  async act(): Promise<boolean> {
    await this.preload();

    //
    const attacker: GameEntityObject = this.from as GameEntityObject;
    const defender: GameEntityObject = this.to as GameEntityObject;
    assertTrue(attacker && defender, 'invalid attacker/defender in attack behavior');
    const attackerModel: CombatantTypes = attacker.model as CombatantTypes;
    const defenderModel: CombatantTypes = defender.model as CombatantTypes;
    assertTrue(
      attackerModel && defenderModel,
      'invalid attacker/defender model attack behavior',
    );
    const playerRender =
      attacker instanceof CombatPlayerComponent
        ? (attacker as CombatPlayerComponent)
        : null;

    const done$ = new BehaviorSubject<boolean>(false);
    const actionCompletePromise = done$
      .pipe(
        filter((d) => d === true),
        take(1),
      )
      .toPromise();

    const attack = async () => {
      const attEquip = this.store.select(getCombatEntityEquipment(attackerModel.eid));
      const defEquip = this.store.select(getCombatEntityEquipment(defenderModel.eid));
      combineLatest([attEquip, defEquip])
        .pipe(first())
        .subscribe(async (args) => {
          const equippedAttacker: EntityWithEquipment = args[0] as EntityWithEquipment;
          const equippedDefender: EntityWithEquipment = args[1] as EntityWithEquipment;
          await this.playAttack(attacker, defender, equippedAttacker, equippedDefender);
          done$.next(true);
        });
    };

    let attackPromise;
    if (playerRender) {
      attackPromise = playerRender.attack(attack);
    } else {
      // TODO: Shouldn't be here.  This mess is currently to delay NPC attacks.
      await new Promise<void>((next) => _.delay(() => next(), 200));
      attackPromise = attack();
    }
    await Promise.all([attackPromise, actionCompletePromise]);
    this.combat.machine.setCurrentState('end-turn');
    return true;
  }
  async playAttack(
    attacker: GameEntityObject,
    defender: GameEntityObject,
    equippedAttacker: EntityWithEquipment,
    equippedDefender: EntityWithEquipment,
  ) {
    const playerRender =
      attacker instanceof CombatPlayerComponent
        ? (attacker as CombatPlayerComponent)
        : null;

    assertTrue(attacker && defender, 'invalid attacker/defender in attack behavior');
    const attackerModel: CombatantTypes = attacker.model as CombatantTypes;
    const defenderModel: CombatantTypes = defender.model as CombatantTypes;
    const damageOutput = this.combatService.attackCombatant(
      equippedAttacker || attacker.model,
      equippedDefender || defender.model,
    );
    const defending: boolean = defenderModel.status.includes('guarding');
    const hitSound = this.getHitSound(
      defenderModel.hp,
      damageOutput.totalDamage,
      defending,
    );
    const damageAnimation = this.getDamageAnimation(
      damageOutput.totalDamage,
      damageOutput.damages.length,
      defending,
    );
    const damage = damageOutput.totalDamage;
    const didKill: boolean = defenderModel.hp - damage <= 0;

    const attackData: CombatAttack = {
      attacker: attackerModel,
      defender: defenderModel,
      damage,
    };
    this.store.dispatch(new CombatAttackAction(attackData));

    const components = {
      animation: new AnimatedSpriteBehavior({
        spriteName: 'attack',
        lengthMS: 350,
      }),
      sprite: new SpriteComponent({
        name: 'attack',
        icon: damageAnimation,
      }),
      damage: new DamageComponent(),
      sound: new SoundBehavior({
        url: hitSound,
        volume: 0.3,
      }),
    };
    if (playerRender) {
      playerRender.setState('Moving');
    }
    defender.addComponentDictionary(components);
    const data: CombatAttackSummary = {
      damage,
      attacker,
      defender,
    };
    const attackPromise = this.combat.machine.onAttack$.emit(data);
    await components.damage.onDone$.pipe(take(1)).toPromise();
    if (playerRender) {
      playerRender.setState();
    }
    if (didKill) {
      defender.destroy();
    }
    defender.removeComponentDictionary(components);

    return attackPromise;
  }
}

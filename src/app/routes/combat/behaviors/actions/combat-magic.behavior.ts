import * as _ from 'underscore';
import {CombatActionBehavior} from '../combat-action.behavior';
import {GameEntityObject} from '../../../../../game/rpg/objects/gameEntityObject';
import {HeroTypes, HeroModel} from '../../../../../game/rpg/models/heroModel';
import {CombatEndTurnState} from '../../states/combat-end-turn.state';
import {getSoundEffectUrl} from '../../../../../game/pow2/core/api';
import {AnimatedSpriteComponent} from '../../../../../game/pow2/tile/components/animatedSpriteComponent';
import {SpriteComponent} from '../../../../../game/pow2/tile/components/spriteComponent';
import {SoundComponent} from '../../../../../game/pow2/scene/components/soundComponent';
import {DamageComponent} from '../../../../../game/rpg/components/damageComponent';
import {CreatureModel} from '../../../../../game/rpg/models/creatureModel';
import {CombatPlayerRenderBehavior} from '../combat-player-render.behavior';
import {Component, Input} from '@angular/core';
import {IPlayerActionCallback} from '../../states/combat.machine';
import {CombatComponent} from '../../combat.component';
import {damage} from '../../../../models/combat/combat.api';


/**
 * Use magic in
 */
@Component({
  selector: 'combat-magic-behavior',
  template: '<ng-content></ng-content>'
})
export class CombatMagicBehavior extends CombatActionBehavior {
  name: string = "magic";
  @Input() combat: CombatComponent;

  canBeUsedBy(entity: GameEntityObject) {
    // Include only magic casters
    var supportedTypes = [
      HeroTypes.LifeMage,
      HeroTypes.Necromancer
    ];
    return super.canBeUsedBy(entity) && _.indexOf(supportedTypes, entity.model.type) !== -1;
  }

  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    const done = (error?: any) => {
      then && then(this, error);
      this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
    };
    if (!this.spell) {
      console.error("null spell to cast");
      return false;
    }
    switch (this.spell.id) {
      case 'heal':
        return this.healSpell(done);
      case 'push':
        return this.hurtSpell(done);
    }
    return true;
  }

  healSpell(done?: (error?: any) => any) {
    //
    const caster: GameEntityObject = this.from;
    const target: GameEntityObject = this.to;
    const attackerPlayer = caster.findBehavior(CombatPlayerRenderBehavior) as CombatPlayerRenderBehavior;

    attackerPlayer.magic(() => {
      var level: number = target.model.level;
      var healAmount: number = -this.spell.value;
      target.model.damage(healAmount);


      var hitSound: string = getSoundEffectUrl('heal');
      var components = {
        animation: new AnimatedSpriteComponent({
          spriteName: 'heal',
          lengthMS: 550
        }),
        sprite: new SpriteComponent({
          name: 'heal',
          icon: "animSpellCast.png"
        }),
        sound: new SoundComponent({
          url: hitSound,
          volume: 0.3
        })
      };
      target.addComponentDictionary(components);
      components.animation.once('animation:done', () => {
        target.removeComponentDictionary(components);
        const data: CombatAttackSummary = {
          damage: healAmount,
          attacker: caster,
          defender: target
        };
        this.combat.machine.notify('combat:attack', data, done);
      });
    });

    return true;

  }

  hurtSpell(done?: (error?: any)=>any) {
    //
    const attacker: GameEntityObject = this.from;
    const defender: GameEntityObject = this.to;

    const attackerPlayer = attacker.findBehavior(CombatPlayerRenderBehavior) as CombatPlayerRenderBehavior;
    attackerPlayer.magic(() => {
      const attackModel = attacker.model;
      const magicAttack = attackModel.calculateDamage(attackModel.getMagicStrength() + this.spell.value);
      const damage: number = damage(defender.model, magicAttack);
      const didKill: boolean = defender.model.hp <= 0;
      const hit: boolean = damage > 0;
      const hitSound: string = getSoundEffectUrl((didKill ? "killed" : (hit ? "spell" : "miss")));
      const components = {
        animation: new AnimatedSpriteComponent({
          spriteName: "attack",
          lengthMS: 550
        }),
        sprite: new SpriteComponent({
          name: "attack",
          icon: hit ? "animHitSpell.png" : "animMiss.png"
        }),
        damage: new DamageComponent(),
        sound: new SoundComponent({
          url: hitSound,
          volume: 0.3
        })
      };
      defender.addComponentDictionary(components);
      components.damage.once('damage:done', () => {
        if (didKill && defender.model instanceof CreatureModel) {
          _.defer(() => {
            defender.destroy();
          });
        }
        defender.removeComponentDictionary(components);
      });
      const data: CombatAttackSummary = {
        damage: damage,
        attacker: attacker,
        defender: defender
      };
      this.combat.machine.notify('combat:attack', data, done);
    });
    return true;

  }
}

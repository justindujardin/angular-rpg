/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import * as _ from 'underscore';
import {CombatActionComponent} from './combatActionComponent';
import {GameEntityObject} from '../../../objects/gameEntityObject';
import {CreatureModel} from '../../../models/creatureModel';
import {HeroTypes, HeroModel} from '../../../models/heroModel';
import {IPlayerActionCallback, CombatAttackSummary} from '../../../states/playerCombatState';
import {CombatEndTurnState} from '../../../states/combat/combatEndTurnState';
import {DamageComponent} from '../../damageComponent';
import {PlayerCombatRenderComponent} from '../../../../pow2/game/components/playerCombatRenderComponent';
import {AnimatedSpriteComponent} from '../../../../pow2/tile/components/animatedSpriteComponent';
import {SpriteComponent} from '../../../../pow2/tile/components/spriteComponent';
import {SoundComponent} from '../../../../pow2/scene/components/soundComponent';
import {GameWorld} from '../../../../gameWorld';


/**
 * Use magic in
 */
export class CombatMagicComponent extends CombatActionComponent {
  name: string = "magic";

  canBeUsedBy(entity: GameEntityObject) {
    // Include only magic casters
    var supportedTypes = [
      HeroTypes.LifeMage,
      HeroTypes.Necromancer
    ];
    return super.canBeUsedBy(entity) && _.indexOf(supportedTypes, entity.model.get('type')) !== -1;
  }

  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    var done = (error?: any) => {
      then && then(this, error);
      this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
    };
    if (!this.spell) {
      console.error("null spell to cast");
      return false;
    }
    switch (this.spell.id) {
      case "heal":
        return this.healSpell(done);
      case "push":
        return this.hurtSpell(done);
    }
    return true;
  }

  healSpell(done?: (error?: any)=>any) {
    //
    var caster: GameEntityObject = this.from;
    var target: GameEntityObject = this.to;
    var attackerPlayer = <PlayerCombatRenderComponent>
      caster.findComponent(PlayerCombatRenderComponent);

    attackerPlayer.magic(()=> {
      var level: number = target.model.get('level');
      var healAmount: number = -this.spell.value;
      target.model.damage(healAmount);


      var hitSound: string = GameWorld.getSoundEffectUrl("heal");
      var components = {
        animation: new AnimatedSpriteComponent({
          spriteName: "heal",
          lengthMS: 550
        }),
        sprite: new SpriteComponent({
          name: "heal",
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
        var data: CombatAttackSummary = {
          damage: healAmount,
          attacker: caster,
          defender: target
        };
        this.combat.machine.notify("combat:attack", data, done);
      });
    });

    return true;

  }

  hurtSpell(done?: (error?: any)=>any) {
    //
    const attacker: GameEntityObject = this.from;
    const defender: GameEntityObject = this.to;

    const attackerPlayer = attacker.findComponent(PlayerCombatRenderComponent) as PlayerCombatRenderComponent;
    attackerPlayer.magic(() => {
      const attackModel = <HeroModel>attacker.model;
      const magicAttack = attackModel.calculateDamage(attackModel.getMagicStrength() + this.spell.value);
      const damage: number = defender.model.damage(magicAttack);
      const didKill: boolean = defender.model.get('hp') <= 0;
      const hit: boolean = damage > 0;
      const hitSound: string = GameWorld.getSoundEffectUrl((didKill ? "killed" : (hit ? "spell" : "miss")));
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
      this.combat.machine.notify("combat:attack", data, done);
    });
    return true;

  }
}

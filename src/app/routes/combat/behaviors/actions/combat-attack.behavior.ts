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
import {GameEntityObject} from '../../../../../game/rpg/objects/gameEntityObject';
import {HeroTypes, HeroModel} from '../../../../../game/rpg/models/heroModel';
import {IPlayerActionCallback, CombatAttackSummary} from '../../playerCombatState';
import {CombatEndTurnState} from '../../states/combat-end-turn.state';
import {getSoundEffectUrl} from '../../../../../game/pow2/core/api';
import {AnimatedSpriteComponent} from '../../../../../game/pow2/tile/components/animatedSpriteComponent';
import {SpriteComponent} from '../../../../../game/pow2/tile/components/spriteComponent';
import {DamageComponent} from '../../../../../game/rpg/components/damageComponent';
import {SoundComponent} from '../../../../../game/pow2/scene/components/soundComponent';
import {CreatureModel} from '../../../../../game/rpg/models/creatureModel';
import {CombatPlayerRenderBehavior} from '../combat-player-render.behavior';
import {CombatActionBehavior} from '../combat-action.behavior';
import {Component} from '@angular/core';
/**
 * Attack another entity in combat.
 */
@Component({
  selector: 'combat-attack-behavior',
  template: '<ng-content></ng-content>'
})
export class CombatAttackBehavior extends CombatActionBehavior {
  name: string = "attack";

  canBeUsedBy(entity: GameEntityObject) {
    // Exclude magic casters from physical attacks
    const excludedTypes = [
      HeroTypes.LifeMage,
      HeroTypes.Necromancer
    ];
    return super.canBeUsedBy(entity) && _.indexOf(excludedTypes, entity.model.type) === -1;
  }


  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    const done = (error?: any) => {
      then && then(this, error);
      this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
    };

    //
    const attacker: GameEntityObject = this.from;
    const defender: GameEntityObject = this.to;
    let attackerPlayer = attacker.findBehavior(CombatPlayerRenderBehavior) as CombatPlayerRenderBehavior;
    const attack = () => {
      const damage: number = attacker.model.attack(defender.model);
      const didKill: boolean = defender.model.hp <= 0;
      const hit: boolean = damage > 0;
      const defending: boolean = (defender.model instanceof HeroModel) && (<HeroModel>defender.model).defenseBuff > 0;
      const hitSound: string = getSoundEffectUrl(didKill ? 'killed' : (hit ? (defending ? 'miss' : 'hit') : 'miss'));
      const components = {
        animation: new AnimatedSpriteComponent({
          spriteName: 'attack',
          lengthMS: 350
        }),
        sprite: new SpriteComponent({
          name: 'attack',
          icon: hit ? (defending ? 'animSmoke.png' : 'animHit.png') : 'animMiss.png'
        }),
        damage: new DamageComponent(),
        sound: new SoundComponent({
          url: hitSound,
          volume: 0.3
        })
      };
      if (!!attackerPlayer) {
        attackerPlayer.setState('Moving');
      }
      defender.addComponentDictionary(components);
      components.damage.once('damage:done', () => {
        if (!!attackerPlayer) {
          attackerPlayer.setState();
        }
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
    };

    if (!!attackerPlayer) {
      attackerPlayer.attack(attack);
    }
    else {
      // TODO: Shouldn't be here.  This mess is currently to delay NPC attacks.
      _.delay(() => {
        attack();
      }, 1000);
    }
    return true;
  }

}

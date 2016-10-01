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
import {IPlayerActionCallback} from '../../../states/playerCombatState';
import {CombatEndTurnState} from '../../../states/combat/combatEndTurnState';
import {UsableModel} from '../../../models/all';
import {PlayerCombatRenderComponent} from '../../../../pow2/game/components/playerCombatRenderComponent';
import {AnimatedSpriteComponent} from '../../../../pow2/tile/components/animatedSpriteComponent';
import {SpriteComponent} from '../../../../pow2/tile/components/spriteComponent';
import {SoundComponent} from '../../../../pow2/scene/components/soundComponent';


/**
 * Use an item in combat
 */
export class CombatItemComponent extends CombatActionComponent {
  name: string = "item";


  canBeUsedBy(entity: GameEntityObject): boolean {
    return super.canBeUsedBy(entity)
      // Have a world, model, and inventory
      && entity.world && entity.world.model && entity.world.model.inventory
      // Have Usable items in the inventory
      && _.filter(entity.world.model.inventory, (i: any) => i instanceof UsableModel).length > 0;
  }


  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    var done = (error?: any): any => {
      then && then(this, error);
      this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
    };
    if (!this.item) {
      return done();
    }
    return this.useItem(done);
  }

  useItem(done?: (error?: any)=>any) {
    //
    var user: GameEntityObject = this.from;
    var target: GameEntityObject = this.to;
    var userRender = <PlayerCombatRenderComponent>
      user.findComponent(PlayerCombatRenderComponent);

    userRender.magic(()=> {
      this.item.use(target.model).then(() => {
        user.world.model.removeInventory(this.item);
      });
      var hitSound: string = "sounds/heal";
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
        done();
      });
    });
    return true;
  }

}

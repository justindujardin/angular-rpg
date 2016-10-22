import * as _ from 'underscore';
import {CombatActionBehavior} from '../combat-action.behavior';
import {GameEntityObject} from '../../../../../game/rpg/objects/gameEntityObject';
import {IPlayerActionCallback} from '../../playerCombatState';
import {UsableModel} from '../../../../../game/rpg/models/usableModel';
import {CombatEndTurnState} from '../../states/combat-end-turn.state';
import {AnimatedSpriteComponent} from '../../../../../game/pow2/tile/components/animatedSpriteComponent';
import {SpriteComponent} from '../../../../../game/pow2/tile/components/spriteComponent';
import {SoundComponent} from '../../../../../game/pow2/scene/components/soundComponent';
import {CombatPlayerRenderBehavior} from '../combat-player-render.behavior';


/**
 * Use an item in combat
 */
export class CombatItemComponent extends CombatActionBehavior {
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
    var userRender = user.findBehavior(CombatPlayerRenderBehavior) as CombatPlayerRenderBehavior;

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

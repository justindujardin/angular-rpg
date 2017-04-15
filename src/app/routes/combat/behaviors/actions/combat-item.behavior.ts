// import * as _ from 'underscore';
// import {CombatActionBehavior} from '../combat-action.behavior';
// import {GameEntityObject} from '../../../../../game/rpg/objects/gameEntityObject';
// import {UsableModel} from '../../../../../game/rpg/models/usableModel';
// import {CombatEndTurnStateComponent} from '../../states/combat-end-turn.state';
// import {AnimatedSpriteBehavior} from '../../../../../game/pow2/tile/behaviors/animatedSpriteComponent';
// import {SpriteComponent} from '../../../../../game/pow2/tile/behaviors/spriteComponent';
// import {SoundBehavior} from '../../../../../game/pow2/scene/behaviors/soundComponent';
// import {CombatPlayerRenderBehavior} from '../combat-player-render.behavior';
// import {Component, Input} from '@angular/core';
// import {IPlayerActionCallback} from '../../states/combat.machine';
// import {CombatComponent} from '../../combat.component';
//
//
// /**
//  * Use an item in combat
//  */
// @Component({
//   selector: 'combat-item-behavior',
//   template: '<ng-content></ng-content>'
// })
// export class CombatItemBehavior extends CombatActionBehavior {
//   name: string = "item";
//   @Input() combat: CombatComponent;
//
//   canBeUsedBy(entity: GameEntityObject): boolean {
//     return super.canBeUsedBy(entity)
//       // Have a world, model, and inventory
//       && entity.world && entity.world.model && entity.world.model.inventory
//       // Have Usable items in the inventory
//       && _.filter(entity.world.model.inventory, (i: any) => i instanceof UsableModel).length > 0;
//   }
//
//
//   act(then?: IPlayerActionCallback): boolean {
//     if (!this.isCurrentTurn()) {
//       return false;
//     }
//     var done = (error?: any): any => {
//       then && then(this, error);
//       this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
//     };
//     if (!this.item) {
//       return done();
//     }
//     return this.useItem(done);
//   }
//
//   useItem(done?: (error?: any)=>any) {
//     //
//     var user: GameEntityObject = this.from;
//     var target: GameEntityObject = this.to;
//     var userRender = user.findBehavior(CombatPlayerRenderBehaviorComponent) as CombatPlayerRenderBehaviorComponent;
//
//     userRender.magic(()=> {
//       this.item.use(target.model).then(() => {
//         user.world.model.removeInventory(this.item);
//       });
//       var hitSound: string = "sounds/heal";
//       var behaviors = {
//         animation: new AnimatedSpriteBehavior({
//           spriteName: "heal",
//           lengthMS: 550
//         }),
//         sprite: new SpriteComponent({
//           name: "heal",
//           icon: "animSpellCast.png"
//         }),
//         sound: new SoundBehavior({
//           url: hitSound,
//           volume: 0.3
//         })
//       };
//       target.addComponentDictionary(behaviors);
//       behaviors.animation.once('animation:done', () => {
//         target.removeComponentDictionary(behaviors);
//         done();
//       });
//     });
//     return true;
//   }
//
// }

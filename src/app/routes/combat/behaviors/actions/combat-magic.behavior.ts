// import * as _ from "underscore";
// import {CombatActionBehavior} from "../combat-action.behavior";
// import {GameEntityObject} from "../../../../../game/rpg/objects/gameEntityObject";
// import {HeroTypes} from "../../../../../game/rpg/models/heroModel";
// import {CombatEndTurnStateComponent} from "../../states/combat-end-turn.state";
// import {getSoundEffectUrl} from "../../../../../game/pow2/core/api";
// import {AnimatedSpriteBehavior} from "../../../../../game/pow2/tile/behaviors/animatedSpriteComponent";
// import {SpriteComponent} from "../../../../../game/pow2/tile/behaviors/spriteComponent";
// import {SoundBehavior} from "../../../../../game/pow2/scene/behaviors/soundComponent";
// import {DamageComponent} from "../../../../../game/rpg/behaviors/damageComponent";
// import {CreatureModel} from "../../../../../game/rpg/models/creatureModel";
// import {CombatPlayerRenderBehaviorComponent} from "../combat-player-render.behavior";
// import {Component, Input} from "@angular/core";
// import {IPlayerActionCallback} from "../../states/combat.machine";
// import {CombatComponent, CombatAttackSummary} from "../../combat.component";
//
//
// /**
//  * Use magic in
//  */
// @Component({
//   selector: 'combat-magic-behavior',
//   template: '<ng-content></ng-content>'
// })
// export class CombatMagicBehavior extends CombatActionBehavior {
//   name: string = "magic";
//   @Input() combat: CombatComponent;
//
//   canBeUsedBy(entity: GameEntityObject) {
//     // Include only magic casters
//     var supportedTypes = [
//       HeroTypes.LifeMage,
//       HeroTypes.Necromancer
//     ];
//     return super.canBeUsedBy(entity) && _.indexOf(supportedTypes, entity.model.type) !== -1;
//   }
//
//   act(then?: IPlayerActionCallback): boolean {
//     if (!this.isCurrentTurn()) {
//       return false;
//     }
//     const done = (error?: any) => {
//       then && then(this, error);
//       this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
//     };
//     if (!this.spell) {
//       console.error("null spell to cast");
//       return false;
//     }
//     switch (this.spell.id) {
//       case 'heal':
//         return this.healSpell(done);
//       case 'push':
//         return this.hurtSpell(done);
//     }
//     return true;
//   }
//
//   healSpell(done?: (error?: any) => any) {
//     //
//     const caster: GameEntityObject = this.from;
//     const target: GameEntityObject = this.to;
//     const attackerPlayer = caster.findBehavior(CombatPlayerRenderBehaviorComponent)
//              as CombatPlayerRenderBehaviorComponent;
//
//     attackerPlayer.magic(() => {
//       var level: number = target.model.level;
//       var healAmount: number = -this.spell.value;
//       target.model.damage(healAmount);
//
//
//       var hitSound: string = getSoundEffectUrl('heal');
//       var behaviors = {
//         animation: new AnimatedSpriteBehavior({
//           spriteName: 'heal',
//           lengthMS: 550
//         }),
//         sprite: new SpriteComponent({
//           name: 'heal',
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
//         const data: CombatAttackSummary = {
//           damage: healAmount,
//           attacker: caster,
//           defender: target
//         };
//         this.combat.machine.notify('combat:attackCombatant', data, done);
//       });
//     });
//
//     return true;
//
//   }
//
//   hurtSpell(done?: (error?: any)=>any) {
//     //
//     const attacker: GameEntityObject = this.from;
//     const defender: GameEntityObject = this.to;
//
//     const attackerPlayer = attacker.findBehavior(CombatPlayerRenderBehaviorComponent)
//                  as CombatPlayerRenderBehaviorComponent;
//     attackerPlayer.magic(() => {
//       const attackModel = attacker.model;
//       const magicAttack = attackModel.varyDamage(attackModel.getMagic() + this.spell.value);
//       const damage: number = damage(defender.model, magicAttack);
//       const didKill: boolean = defender.model.hp <= 0;
//       const hit: boolean = damage > 0;
//       const hitSound: string = getSoundEffectUrl((didKill ? "killed" : (hit ? "spell" : "miss")));
//       const map = {
//         animation: new AnimatedSpriteBehavior({
//           spriteName: "attackCombatant",
//           lengthMS: 550
//         }),
//         sprite: new SpriteComponent({
//           name: "attackCombatant",
//           icon: hit ? "animHitSpell.png" : "animMiss.png"
//         }),
//         damage: new DamageComponent(),
//         sound: new SoundBehavior({
//           url: hitSound,
//           volume: 0.3
//         })
//       };
//       defender.addComponentDictionary(map);
//       map.damage.once('damage:done', () => {
//         if (didKill && defender.model instanceof CreatureModel) {
//           _.defer(() => {
//             defender.destroy();
//           });
//         }
//         defender.removeComponentDictionary(map);
//       });
//       const data: CombatAttackSummary = {
//         damage: damage,
//         attacker: attacker,
//         defender: defender
//       };
//       this.combat.machine.notify('combat:attackCombatant', data, done);
//     });
//     return true;
//
//   }
// }

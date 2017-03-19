// import * as _ from 'underscore';
// import {CombatEndTurnStateComponent} from '../../states/combat-end-turn.state';
// import {CombatStateMachineComponent, IPlayerActionCallback} from '../../states/combat.machine';
// import {HeroModel} from '../../../../../game/rpg/models/heroModel';
// import {CombatChooseActionStateComponent} from '../../states/combat-choose-action.state';
// import {CombatVictoryStateComponent} from '../../states/combat-victory.state';
// import {CombatDefeatStateComponent} from '../../states/combat-defeat.state';
// import {CombatEscapeStateComponent} from '../../states/combat-escape.state';
// import {CombatMachineState} from '../../states/combat-base.state';
// import {CombatActionBehavior} from '../combat-action.behavior';
// import {Component, Input} from '@angular/core';
// import {CombatComponent} from '../../combat.component';
// import {Entity} from "../../../../models/entity/entity.model";
//
// @Component({
//   selector: 'combat-guard-behavior',
//   template: '<ng-content></ng-content>'
// })
// export class CombatGuardBehavior extends CombatActionBehavior {
//   name: string = "guard";
//   @Input() combat: CombatComponent;
//
//   canTarget(): boolean {
//     return false;
//   }
//
//   act(then?: IPlayerActionCallback): boolean {
//     this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
//     return super.act(then);
//   }
//
//
//   /**
//    * Until the end of the next turn, or combat end, increase the
//    * current players defense.
//    */
//   select() {
//     console.warn('guard action is ignored in combat-attackCombatant behavior');
//     this.combat.machine.on(CombatStateMachineComponent.Events.ENTER, this.enterState, this);
//     console.info("Adding guard defense buff to player: " + this.from.model.name);
//     if (!(this.from.model instanceof HeroModel)) {
//       throw new Error("This action is not currently applicable to non hero characters.");
//     }
//     const model = this.from.model as Entity;
//     const multiplier: number = model.level < 10 ? 2 : 0.5;
//     console.warn('todo: buff is busted');
//     // model.defenseBuff += (model.getDefense(true) * multiplier);
//   }
//
//   enterState(newState: CombatMachineState, oldState: CombatMachineState) {
//     var exitStates: string[] = [
//       CombatChooseActionStateComponent.NAME,
//       CombatVictoryStateComponent.NAME,
//       CombatDefeatStateComponent.NAME,
//       CombatEscapeStateComponent.NAME
//     ];
//     if (_.indexOf(exitStates, newState.name) !== -1) {
//       console.info("Removing guard defense buff from player: " + this.from.model.name);
//       this.combat.machine.off(CombatStateMachineComponent.Events.ENTER, this.enterState, this);
//       console.warn('todo: buff is busted');
//       // var heroModel = <HeroModel>this.from.model;
//       // heroModel.defenseBuff = 0;
//     }
//   }
// }

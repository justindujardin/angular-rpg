import {Component, ElementRef, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {Animate} from '../../services/index';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';
import {CombatPlayerRenderBehavior} from './behaviors/combat-player-render.behavior';
import {SceneComponent} from '../../../game/pow2/scene/sceneComponent';



@Component({
  selector: 'combat-player',
  template: `
  <combat-player-render-behavior></combat-player-render-behavior>
  <animated-behavior></animated-behavior>
`
})
export class CombatPlayer extends GameEntityObject implements AfterViewInit {
  @ViewChildren(SceneComponent) components: QueryList<SceneComponent>;

  constructor(public elRef: ElementRef, public animate: Animate) {
    super();
    //   model: HeroModel,
    //     combat: PlayerCombatState
    // },
    // components: [
    //   {name: 'render', type: CombatPlayerRenderBehavior},
    //   {name: 'animation', type: AnimatedComponent},
    //   {name: 'attack', type: CombatAttackComponent, params: ['combat']},
    //   {name: 'magic', type: CombatMagicComponent, params: ['combat']},
    //   {name: 'item', type: CombatItemComponent, params: ['combat']},
    //   {name: 'run', type: CombatRunComponent, params: ['combat']},
    //   {name: 'guard', type: CombatGuardComponent, params: ['combat']}
    //   ]

  }

  ngAfterViewInit(): void {
    console.log("CombatPlayer components: ");
    console.log(this.components);
  }

}


/** Components assocaited with combat player */
export const COMBAT_PLAYER_COMPONENTS = [
  CombatPlayerRenderBehavior,
  CombatPlayer
];

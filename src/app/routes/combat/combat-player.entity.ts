import {
  Component,
  AfterViewInit,
  ViewChildren,
  QueryList,
  OnDestroy,
  Inject,
  Input,
  forwardRef,
  ViewChild
} from '@angular/core';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';
import {CombatPlayerRenderBehavior} from './behaviors/combat-player-render.behavior';
import {SceneComponent} from '../../../game/pow2/scene/sceneComponent';
import {CombatAttackBehavior} from './behaviors/actions/combat-attack.behavior';
// import {CombatMagicBehavior} from './behaviors/actions/combat-magic.behavior';
// import {CombatItemBehavior} from './behaviors/actions/combat-item.behavior';
// import {CombatRunBehavior} from './behaviors/actions/combat-run.behavior';
// import {CombatGuardBehavior} from './behaviors/actions/combat-guard.behavior';
import {CombatComponent} from './combat.component';
import {PartyMember} from "../../models/party/party.model";


@Component({
  selector: 'combat-player',
  template: `
  <combat-player-render-behavior #render></combat-player-render-behavior>
  <animated-behavior #animation></animated-behavior>
  <combat-attack-behavior [combat]="combat" #attack></combat-attack-behavior>
  <!--<combat-magic-behavior [combat]="combat" #magic></combat-magic-behavior>-->
  <!--<combat-item-behavior [combat]="combat" #item></combat-item-behavior>-->
  <!--<combat-run-behavior [combat]="combat" #run></combat-run-behavior>-->
  <!--<combat-guard-behavior [combat]="combat" #guard></combat-guard-behavior>-->
  <ng-content></ng-content>
`
})
export class CombatPlayer extends GameEntityObject implements AfterViewInit, OnDestroy {
  @ViewChildren('render,animation,attackCombatant,magic,guard,item,run') behaviors: QueryList<SceneComponent>;

  @ViewChild(CombatPlayerRenderBehavior) render: CombatPlayerRenderBehavior;

  @Input() model: PartyMember;

  constructor(@Inject(forwardRef(() => CombatComponent)) private combat: CombatComponent) {
    super();
  }

  ngAfterViewInit(): void {
    this.combat.scene.addObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.combat.scene.removeObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }

}


/** Components associated with combat player */
export const COMBAT_PLAYER_COMPONENTS = [
  CombatPlayerRenderBehavior,
  CombatAttackBehavior,
  // CombatMagicBehavior,
  // CombatItemBehavior,
  // CombatRunBehavior,
  // CombatGuardBehavior,
  CombatPlayer
];

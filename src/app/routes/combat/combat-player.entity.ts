import {
  AfterViewInit,
  Component,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {GameEntityObject} from '../../scene/game-entity-object';
import {CombatPlayerRenderBehaviorComponent} from './behaviors/combat-player-render.behavior';
import {SceneObjectBehavior} from '../../../game/pow2/scene/scene-object-behavior';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
// import {CombatMagicBehavior} from './behaviors/actions/combat-magic.behavior';
// import {CombatItemBehavior} from './behaviors/actions/combat-item.behavior';
import {CombatRunBehaviorComponent} from './behaviors/actions/combat-run.behavior';
// import {CombatGuardBehavior} from './behaviors/actions/combat-guard.behavior';
import {CombatComponent} from './combat.component';
import {Entity} from '../../models/entity/entity.model';

@Component({
  selector: 'combat-player',
  template: `
    <combat-player-render-behavior #render></combat-player-render-behavior>
    <animated-behavior #animation></animated-behavior>
    <combat-attack-behavior [combat]="combat" #attack></combat-attack-behavior>
    <!--<combat-magic-behavior [combat]="combat" #magic></combat-magic-behavior>-->
    <!--<combat-item-behavior [combat]="combat" #item></combat-item-behavior>-->
    <combat-run-behavior [combat]="combat" #run></combat-run-behavior>
    <!--<combat-guard-behavior [combat]="combat" #guard></combat-guard-behavior>-->
    <ng-content></ng-content>
  `
})
export class CombatPlayerComponent extends GameEntityObject implements AfterViewInit, OnDestroy {
  @ViewChildren('render,animation,attack,magic,guard,item,run') behaviors: QueryList<SceneObjectBehavior>;

  @ViewChild(CombatPlayerRenderBehaviorComponent) render: CombatPlayerRenderBehaviorComponent;

  @Input() model: Entity;

  @Input() icon: string;

  constructor(@Inject(forwardRef(() => CombatComponent)) public combat: CombatComponent) {
    super();
  }

  get visible(): boolean {
    return this.model && this.model.hp > 0;
  }

  ngAfterViewInit(): void {
    this.combat.scene.addObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.combat.scene.removeObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }

}

/** Components associated with combat player */
export const COMBAT_PLAYER_COMPONENTS = [
  CombatPlayerRenderBehaviorComponent,
  CombatAttackBehaviorComponent,
  // CombatMagicBehavior,
  // CombatItemBehavior,
  CombatRunBehaviorComponent,
  // CombatGuardBehavior,
  CombatPlayerComponent
];

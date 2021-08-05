import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Scene } from '../../../game/pow2/scene/scene';
import { SceneObjectBehavior } from '../../../game/pow2/scene/scene-object-behavior';
import { IPartyMember } from '../../models/base-entity';
import { GameEntityObject } from '../../scene/game-entity-object';
import { CombatPlayerRenderBehaviorComponent } from './behaviors/combat-player-render.behavior';

@Component({
  selector: 'combat-player',
  template: `
    <combat-player-render-behavior #render></combat-player-render-behavior>
    <animated-behavior #animation></animated-behavior>
    <combat-attack-behavior [combat]="combat" #attack></combat-attack-behavior>
    <combat-magic-behavior [combat]="combat" #magic></combat-magic-behavior>
    <combat-item-behavior [combat]="combat" #item></combat-item-behavior>
    <combat-run-behavior [combat]="combat" #run></combat-run-behavior>
    <combat-guard-behavior [combat]="combat" #guard></combat-guard-behavior>
    <ng-content></ng-content>
  `,
})
export class CombatPlayerComponent
  extends GameEntityObject
  implements AfterViewInit, OnDestroy {
  @ViewChildren('render,animation,attack,magic,guard,item,run')
  behaviors: QueryList<SceneObjectBehavior>;

  @ViewChild(CombatPlayerRenderBehaviorComponent)
  render: CombatPlayerRenderBehaviorComponent;
  @Input() model: IPartyMember;
  // @ts-ignore
  @Input() icon: string;
  @Input() scene: Scene;
  @Input() combat: any; // CombatComponent - flirts with circular imports


  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }
}

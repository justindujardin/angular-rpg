import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Scene } from '../../../game/pow2/scene/scene';
import { SpriteRenderBehaviorComponent } from '../../behaviors/sprite-render.behavior';
import { IEnemy } from '../../models/base-entity';
import { GameEntityObject } from '../../scene/game-entity-object';
import { CombatAttackBehaviorComponent } from './behaviors/actions/combat-attack.behavior';

@Component({
  selector: 'combat-enemy',
  template: `
    <sprite-render-behavior [icon]="(model$ | async)?.icon"></sprite-render-behavior>
    <combat-attack-behavior [combat]="combat" #attack></combat-attack-behavior>
    <ng-content></ng-content>
  `,
})
export class CombatEnemyComponent
  extends GameEntityObject
  implements AfterViewInit, OnDestroy {
  @ViewChild(CombatAttackBehaviorComponent)
  attack: CombatAttackBehaviorComponent;

  @ViewChild(SpriteRenderBehaviorComponent)
  render: SpriteRenderBehaviorComponent;
  private _model$ = new BehaviorSubject<IEnemy>(null);

  model$: Observable<IEnemy> = this._model$;

  // @ts-ignore
  @Input() icon: string;
  @Input() scene: Scene;
  @Input() combat: any; // CombatComponent - flirts with circular imports

  // @ts-ignore
  @Input() set model(value: IEnemy) {
    this._model$.next(value);
  }

  get model(): IEnemy {
    return this._model$.value;
  }

  private _spriteSubscription: Subscription;

  // @ts-ignore
  get visible(): boolean {
    return this.model && this.model.hp > 0;
  }

  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.addBehavior(this.render);
    this.addBehavior(this.attack);
    this._spriteSubscription = this.model$
      .pipe(
        distinctUntilChanged(),
        map((m: IEnemy) => {
          this.setSprite(m ? m.icon : null);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.removeBehavior(this.render);
    this.removeBehavior(this.attack);
    if (this.scene) {
      this.scene.removeObject(this);
    }
    this._spriteSubscription.unsubscribe();
    this.destroy();
  }
}

import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SpriteRenderBehaviorComponent } from '../../behaviors/sprite-render.behavior';
import { IEnemy } from '../../models/base-entity';
import { GameEntityObject } from '../../scene/objects/game-entity-object';
import { Scene } from '../../scene/scene';
import { CombatAttackBehaviorComponent } from './behaviors/actions/combat-attack.behavior';

@Component({
  selector: 'combat-enemy',
  templateUrl: 'combat-enemy.component.html',
})
export class CombatEnemyComponent
  extends GameEntityObject
  implements AfterViewInit, OnDestroy
{
  @ViewChild(CombatAttackBehaviorComponent)
  attack: CombatAttackBehaviorComponent;

  @ViewChild(SpriteRenderBehaviorComponent)
  render: SpriteRenderBehaviorComponent;
  private _model$ = new BehaviorSubject<IEnemy | null>(null);

  model$: Observable<IEnemy | null> = this._model$;

  // @ts-ignore
  @Input() icon: string;
  @Input() scene: Scene | null = null;
  @Input() combat: any; // CombatComponent - flirts with circular imports

  // @ts-ignore
  @Input() set model(value: IEnemy | null) {
    this._model$.next(value);
  }

  get model(): IEnemy | null {
    return this._model$.value;
  }

  constructor() {
    super();
  }

  private _spriteSubscription: Subscription | null;

  ngAfterViewInit(): void {
    this.scene?.addObject(this);
    this.addBehavior(this.render);
    this.addBehavior(this.attack);
    this._spriteSubscription = this.model$
      .pipe(
        distinctUntilChanged(),
        map((m: IEnemy) => {
          this.setSprite(m.icon);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.removeBehavior(this.render);
    this.removeBehavior(this.attack);
    if (this.scene) {
      this.scene.removeObject(this);
    }
    this._spriteSubscription?.unsubscribe();
    this._spriteSubscription = null;
    this.destroy();
  }
}

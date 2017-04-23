import {AfterViewInit, Component, forwardRef, Inject, Input, OnDestroy, ViewChild} from '@angular/core';
import {GameEntityObject} from '../../scene/game-entity-object';
import {CombatComponent} from './combat.component';
import {Combatant} from '../../models/combat/combat.model';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
import {SpriteRenderBehaviorComponent} from '../../behaviors/sprite-render.behavior';

@Component({
  selector: 'combat-enemy',
  template: `
    <sprite-render-behavior [icon]="(model$ | async)?.icon"></sprite-render-behavior>
    <combat-attack-behavior [combat]="combat" #attack></combat-attack-behavior>
    <ng-content></ng-content>
  `
})
export class CombatEnemyComponent extends GameEntityObject implements AfterViewInit, OnDestroy {

  @ViewChild(CombatAttackBehaviorComponent) attack: CombatAttackBehaviorComponent;

  @ViewChild(SpriteRenderBehaviorComponent) render: SpriteRenderBehaviorComponent;
  private _model$ = new BehaviorSubject<Combatant>(null);

  model$: Observable<Combatant> = this._model$;

  @Input() icon: string;

  @Input() set model(value: Combatant) {
    this._model$.next(value);
  }

  get model(): Combatant {
    return this._model$.value;
  }

  private _spriteSubscription: Subscription;

  constructor(@Inject(forwardRef(() => CombatComponent)) public combat: CombatComponent) {
    super();
  }

  get visible(): boolean {
    return this.model && this.model.hp > 0;
  }

  ngAfterViewInit(): void {
    this.combat.scene.addObject(this);
    this.addBehavior(this.render);
    this.addBehavior(this.attack);
    this._spriteSubscription = this.model$.distinctUntilChanged().do((m: Combatant) => {
      this.setSprite(m ? m.icon : null);
    }).subscribe();
  }

  ngOnDestroy(): void {
    this.removeBehavior(this.render);
    this.removeBehavior(this.attack);
    this.combat.scene.removeObject(this);
    this._spriteSubscription.unsubscribe();
    this.destroy();
  }

}

/** Components associated with combat enemy */
export const COMBAT_ENEMY_COMPONENTS = [
  CombatEnemyComponent
];

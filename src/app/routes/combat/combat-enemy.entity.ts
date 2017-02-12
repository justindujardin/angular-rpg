import {Component, AfterViewInit, OnDestroy, Inject, Input, forwardRef, ViewChild} from '@angular/core';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';
import {CombatComponent} from './combat.component';
import {SpriteComponent} from '../../../game/pow2/tile/components/spriteComponent';
import {Combatant} from '../../models/combat/combat.model';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';

@Component({
  selector: 'combat-enemy',
  template: `
  <combat-attack-behavior [combat]="combat" #attack></combat-attack-behavior>
  <ng-content></ng-content>
`
})
export class CombatEnemyComponent extends GameEntityObject implements AfterViewInit, OnDestroy {
  sprite = new SpriteComponent();

  @ViewChild(CombatAttackBehaviorComponent) attack: CombatAttackBehaviorComponent;

  private _model$ = new BehaviorSubject<Combatant>(null);

  model$: Observable<Combatant> = this._model$;

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

  ngAfterViewInit(): void {
    this.combat.scene.addObject(this);
    this.addBehavior(this.sprite);
    this.addBehavior(this.attack);
    this._spriteSubscription = this.model$.distinctUntilChanged().do((m: Combatant) => {
      this.sprite.setSprite(m ? m.icon : null);
    }).subscribe();
  }

  ngOnDestroy(): void {
    this.removeBehavior(this.sprite);
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

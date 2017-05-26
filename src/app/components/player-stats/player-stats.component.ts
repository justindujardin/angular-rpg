import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {RPGGame} from '../../services/index';
import {HeroModel} from '../../../game/rpg/models/all';
import {Observable} from 'rxjs/Observable';
import {Entity, EntityWithEquipment} from '../../models/entity/entity.model';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {getEntityEquipment} from '../../models/selectors';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {CombatService} from '../../models/combat/combat.service';
import {getXPForLevel} from '../../models/levels';

@Component({
  selector: 'player-stats',
  templateUrl: './player-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerStatsComponent {

  private _showExperience$: Subject<boolean> = new BehaviorSubject<boolean>(true);
  showExperience$: Observable<boolean> = this._showExperience$;

  /**
   * Hide/show experience stats and progress bar to next level
   */
  @Input() set showExperience(value: boolean) {
    this._showExperience$.next(value);
  }

  private _showLevel$: Subject<boolean> = new BehaviorSubject<boolean>(true);
  showLevel$: Observable<boolean> = this._showLevel$;

  /**
   * Hide/show current level
   */
  @Input() set showLevel(value: boolean) {
    this._showLevel$.next(value);
  }

  private _showHP$: Subject<boolean> = new BehaviorSubject<boolean>(true);
  showHP$: Observable<boolean> = this._showHP$;

  /**
   * Hide/show current HP and progress bar indicating percentage health remaining
   * of the total.
   */
  @Input() set showHP(value: boolean) {
    this._showHP$.next(value);
  }

  private _model$: Subject<Entity> = new BehaviorSubject<Entity>(null);
  model$: Observable<Entity> = this._model$;

  /**
   * Set the source entity to render stats for
   */
  @Input() set model(value: Entity) {
    this._model$.next(value);
  }

  /**
   * Resolve any entity equipment IDs to their equipment objects. This gives
   * access to the stats for calculating things like total attack or defense.
   */
  entityWithEquipment$ = this.model$.switchMap((entity: Entity) => {
    return entity ? this.store.select(getEntityEquipment(entity.eid)) : Observable.empty();
  });

  /**
   * Hide/show combat stats attack/defense/speed/magic
   */
  @Input() set showCombatStats(value: boolean) {
    this._showCombatStats$.next(value);
  }

  private _showCombatStats$: Subject<boolean> = new BehaviorSubject<boolean>(true);
  showCombatStats$: Observable<boolean> = this._showCombatStats$;

  /**
   * Total attack strength including weapons
   */
  attack$: Observable<number> = this.entityWithEquipment$.map((equipped: EntityWithEquipment) => {
    return this.combatService.getAttack(equipped);
  });
  /**
   * Total defense including armor and accessories
   */
  defense$: Observable<number> = this.entityWithEquipment$.map((equipped: EntityWithEquipment) => {
    return this.combatService.getDefense(equipped);
  });
  /**
   * Total speed
   */
  speed$: Observable<number> = this.entityWithEquipment$.map((equipped: EntityWithEquipment) => {
    return this.combatService.getSpeed(equipped);
  });
  /**
   * Total magic power
   */
  magic$: Observable<number> = this.entityWithEquipment$.map((equipped: EntityWithEquipment) => {
    return this.combatService.getMagic(equipped);
  });

  /**
   * The amount of experience needed to progress to the next level.
   */
  nextLevelExp$: Observable<number> = this.model$.map((entity: Entity) => {
    return entity ? getXPForLevel(entity.level + 1) : 0;
  });

  /**
   * Percentage of experience gathered toward progressing to the next level.
   */
  nextLevelPercentage$: Observable<number> = this.model$.map((entity: Entity) => {
    if (!entity) {
      return 0;
    }
    const nextLevelExp: number = getXPForLevel(entity.level + 1);
    const currentLevelExp: number = getXPForLevel(entity.level);
    let width = 0;
    if (entity) {
      width = (entity.exp - currentLevelExp) / (nextLevelExp - currentLevelExp) * 100;
    }
    return Math.round(width);
  });

  /**
   * Percentage of health that this player has remaining (0-100)
   */
  healthPercentage$: Observable<number> = this.model$.map((entity: Entity) => {
    return entity ? Math.round(entity.hp / entity.maxhp * 100) : 0;
  });

  constructor(public game: RPGGame,
              public combatService: CombatService,
              public store: Store<AppState>) {
  }
}

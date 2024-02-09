import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { CombatService } from '../../models/combat/combat.service';
import { EntityWithEquipment } from '../../models/entity/entity.model';
import { getXPForLevel } from '../../models/levels';
import { getEntityEquipment } from '../../models/selectors';
import { GameWorld } from '../../services/game-world';
import { RPGGame } from '../../services/rpg-game';

@Component({
  selector: 'player-stats',
  templateUrl: './player-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private _model$ = new BehaviorSubject<EntityWithEquipment | null>(null);
  model$: Observable<EntityWithEquipment | null> = this._model$;

  /**
   * Set the source entity to render stats for
   */
  @Input() set model(value: EntityWithEquipment | null) {
    this._model$.next(value);
  }

  /**
   * Resolve any entity equipment IDs to their equipment objects. This gives
   * access to the stats for calculating things like total attack or defense.
   */
  entityWithEquipment$ = this.model$.pipe(
    switchMap((entity: EntityWithEquipment) => {
      return entity?.eid ? this.store.select(getEntityEquipment(entity.eid)) : EMPTY;
    }),
  );

  /**
   * Hide/show combat stats attack/defense/agility/magic
   */
  @Input() set showCombatStats(value: boolean) {
    this._showCombatStats$.next(value);
  }

  private _showCombatStats$: Subject<boolean> = new BehaviorSubject<boolean>(true);
  showCombatStats$: Observable<boolean> = this._showCombatStats$;

  /**
   * Total attack strength including weapons
   */
  attack$: Observable<number> = this.entityWithEquipment$.pipe(
    map((equipped: EntityWithEquipment) => {
      const equipment = this.combatService.getWeapons(equipped);
      return this.combatService.party.getAttack({
        equipment,
        state: equipped,
      });
    }),
  );
  /**
   * Total defense including armor and accessories
   */
  defense$: Observable<number> = this.entityWithEquipment$.pipe(
    map((equipped: EntityWithEquipment) => {
      const equipment = this.combatService.getArmors(equipped);
      return this.combatService.party.getDefense({ equipment, state: equipped });
    }),
  );
  /**
   * Total evasion including armor and accessories
   */
  evasion$: Observable<number> = this.entityWithEquipment$.pipe(
    map((equipped: EntityWithEquipment) => {
      const equipment = this.combatService.getArmors(equipped);
      return this.combatService.party.getEvasion({ equipment, state: equipped });
    }),
  );

  /**
   * The amount of experience needed to progress to the next level.
   */
  nextLevelExp$: Observable<number> = this.model$.pipe(
    map((entity: EntityWithEquipment) => {
      return entity ? getXPForLevel(entity.level + 1) : 0;
    }),
  );

  /**
   * Percentage of experience gathered toward progressing to the next level.
   */
  nextLevelPercentage$: Observable<number> = this.model$.pipe(
    map((entity: EntityWithEquipment) => {
      if (!entity) {
        return 0;
      }
      const nextLevelExp: number = getXPForLevel(entity.level + 1);
      const currentLevelExp: number = getXPForLevel(entity.level);
      let width = 0;
      if (entity) {
        width =
          ((entity.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
      }
      return Math.round(width);
    }),
  );

  /**
   * Percentage of health that this player has remaining (0-100)
   */
  healthPercentage$: Observable<number> = this.model$.pipe(
    map((entity: EntityWithEquipment) => {
      return entity ? Math.round((entity.hp / entity.maxhp) * 100) : 0;
    }),
  );

  constructor(
    public game: RPGGame,
    public world: GameWorld,
    public combatService: CombatService,
    public store: Store<AppState>,
  ) {}
}

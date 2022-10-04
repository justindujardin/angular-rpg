import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of, Subscriber } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { AppState } from '../../app.model';
import { NotificationService } from '../../components/notification/notification.service';
import { GameStateSaveAction, GameStateSetKeyDataAction } from '../game-state/game-state.actions';
import { Item } from '../item';
import { IPartyStatsDiff } from '../mechanics';
import { getGameMap } from '../selectors';
import { assertTrue } from '../util';
import {
  CombatEncounterAction,
  CombatEncounterErrorAction,
  CombatEncounterReadyAction,
  CombatEscapeAction,
  CombatEscapeCompleteAction,
  CombatVictoryAction,
  CombatVictoryCompleteAction,
  CombatVictorySummary,
} from './combat.actions';
import { CombatEncounter } from './combat.model';
import { CombatService } from './combat.service';

@Injectable()
export class CombatEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private notificationService: NotificationService,
    private combatService: CombatService,
    private router: Router
  ) {}

  @Effect() beginCombat$ = this.actions$.pipe(
    ofType(CombatEncounterAction.typeId),
    switchMap((action: CombatEncounterAction) => {
      return this.combatService.loadEncounter(action.payload);
    }),
    map((encounter: CombatEncounter) => {
      return new CombatEncounterReadyAction(encounter);
    }),
    catchError((e) => {
      return of(new CombatEncounterErrorAction(e.toString()));
    })
  );

  /** route update to combat encounter */
  @Effect({ dispatch: false }) navigateToCombatRoute$ = this.actions$.pipe(
    ofType(CombatEncounterReadyAction.typeId),
    debounceTime(100),
    distinctUntilChanged(),
    map((action: CombatEncounterAction) => {
      const encounter: CombatEncounter = action.payload;
      assertTrue(
        encounter.id || encounter.zone,
        'combat must either be in a zone or have an id'
      );
      return this.router.navigate(['combat', encounter.id || encounter.zone]);
    })
  );

  /**
   * When a combat escape action is dispatched
   */
  @Effect() combatEscape$ = this.actions$.pipe(
    ofType(CombatEscapeAction.typeId),
    map((action: CombatEscapeAction) => {
      // TODO: add a switcMap before this and notify something?
      return new CombatEscapeCompleteAction();
    })
  );

  /**
   * When a combat victory action is dispatched, notify the user about what they've won.
   */
  @Effect() combatVictory$ = this.actions$.pipe(
    ofType(CombatVictoryAction.typeId),
    switchMap((action: CombatVictoryAction) => {
      const data: CombatVictorySummary = action.payload;
      return new Observable((subject: Subscriber<CombatVictoryAction>) => {
        // Gold
        this.notificationService.show(`Found ${data.gold} gold!`, null, 0);
        // Looted items
        if (data.items) {
          data.items.forEach((item: Item) => {
            this.notificationService.show(`Found ${item.name}`, null, 0);
          });
        }
        // Experience
        this.notificationService.show(`Gained ${data.exp} experience!`, null, 0);
        // Party Level ups

        const notifyStat = (statName: string, statValue: number) => {
          if (statValue > 0) {
            this.notificationService.show(
              `${statName} went up by ${statValue}!`,
              null,
              0
            );
          }
        };
        data.levels.forEach((entityDiff: IPartyStatsDiff) => {
          this.notificationService.show(
            `${entityDiff.name} reached level ${entityDiff.level}!`,
            null,
            0
          );
          notifyStat('HP', entityDiff.hp);
          notifyStat('MP', entityDiff.mp);
          notifyStat('Strength', entityDiff.strength);
          notifyStat('Agility', entityDiff.agility);
          notifyStat('Intelligence', entityDiff.intelligence);
          notifyStat('Luck', entityDiff.luck);
        });
        // Fin.
        this.notificationService.show('Enemies Defeated!', () => {
          subject.next(action);
          subject.complete();
        });

        // Also, hide the encounter if it was fixed.
        if (data.type === 'fixed') {
          this.store.dispatch(new GameStateSetKeyDataAction(data.id, true));
        }

        // Save game
        this.store.dispatch(new GameStateSaveAction());
        return () => {
          // No cleanup
        };
      });
    }),
    map((action: CombatVictoryAction) => {
      return new CombatVictoryCompleteAction(action.payload);
    })
  );

  /** route update back to map after a combat encounter */
  @Effect({ dispatch: false }) navigateToMapRoute$ = this.actions$.pipe(
    ofType(CombatVictoryCompleteAction.typeId, CombatEscapeCompleteAction.typeId),
    debounceTime(100),
    switchMap(() => this.store.select(getGameMap)),
    map((targetMap: string) => {
      assertTrue(map, 'cannot return to invalid map from combat');
      return this.router.navigate(['world', targetMap]);
    })
  );
}

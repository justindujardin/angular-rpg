import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Effect, Actions} from '@ngrx/effects';
import {
  CombatActionTypes,
  CombatEncounterReadyAction,
  CombatEncounterErrorAction,
  CombatEncounterAction, CombatVictoryAction, CombatVictoryCompleteAction, CombatActions, CombatVictorySummary
} from './combat.actions';
import {CombatService} from './combat.service';
import {CombatEncounter} from './combat.model';
import {NotificationService} from '../../components/notification/notification.service';
import {Subscriber} from 'rxjs/Subscriber';
import {replace} from '@ngrx/router-store';
import {assertTrue} from '../util';
import {Item} from '../item';
import {Entity} from '../entity/entity.model';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {getGameMap} from '../selectors';

@Injectable()
export class CombatEffects {

  constructor(private actions$: Actions,
              private store: Store<AppState>,
              private notificationService: NotificationService,
              private combatService: CombatService) {
  }

  @Effect() beginCombat$ = this.actions$.ofType(CombatActionTypes.ENCOUNTER)
    .switchMap((action: CombatEncounterAction) => {
      return this.combatService.loadEncounter(action.payload);
    })
    .map((encounter: CombatEncounter) => {
      return new CombatEncounterReadyAction(encounter);
    })
    .catch((e) => {
      return Observable.of(new CombatEncounterErrorAction(e.toString()));
    });

  /** route update to combat encounter */
  @Effect() navigateToCombatRoute$ = this.actions$
    .ofType(CombatActionTypes.ENCOUNTER_READY)
    .debounceTime(100)
    .distinctUntilChanged()
    .map((action: CombatEncounterAction) => {
      const encounter = action.payload as CombatEncounter;
      assertTrue(encounter.id || encounter.zone, 'combat must either be in a zone or have an id');
      return replace(['combat', encounter.id || encounter.zone]);
    });

  /**
   * When a combat victory action is dispatched, notify the user about what they've won.
   */
  @Effect() combatVictory$ = this.actions$.ofType(CombatActionTypes.VICTORY)
    .switchMap((action: CombatVictoryAction) => {
      const data: CombatVictorySummary = action.payload;
      return Observable.create((subject: Subscriber<CombatVictoryAction>) => {
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
        data.levels.forEach((hero: Entity) => {
          this.notificationService.show(`${hero.name} reached level ${hero.level}!`, null, 0);
        });
        // Fin.
        this.notificationService.show('Enemies Defeated!', () => {
          subject.next(action);
          subject.complete();
        });
        return () => {
          // No cleanup
        };
      });
    })
    .map((action: CombatVictoryAction) => {
      return new CombatVictoryCompleteAction(action.payload);
    });

  /** route update back to map after a combat encounter */
  @Effect() navigateToMapRoute$ = this.actions$
    .ofType(CombatActionTypes.VICTORY_COMPLETE)
    .debounceTime(100)
    .switchMap(() => this.store.select(getGameMap))
    .map((map: string) => {
      assertTrue(map, 'cannot return to invalid map from combat');
      return replace(['world', map]);
    });

}

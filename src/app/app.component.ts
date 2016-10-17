/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router, Event, NavigationStart, NavigationCancel, NavigationError} from '@angular/router';
import {LoadingService} from './components/loading/loading.service';
import {Observable} from 'rxjs/Rx';
import {Store, Action} from '@ngrx/store';
import {GameState} from './models/game-state/game-state.model';
import {AppState} from './app.model';
import {Effect, Actions} from '@ngrx/effects';
import {GameStateActions} from './models/game-state/game-state.actions';
import {go} from '@ngrx/router-store';

function isStart(e: Event): boolean {
  return e instanceof NavigationStart;
}
function isEnd(e: Event): boolean {
  return e instanceof NavigationEnd ||
    e instanceof NavigationCancel || e instanceof NavigationError;
}

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.scss'],
  template: require('./app.component.html')
})
export class App {


  @Effect() gameStateLoaded$ = this.actions$
    .ofType(GameStateActions.LOAD_COMPLETED)
    .distinctUntilChanged()
    .map((action: Action) => {
      return go(['world', action.payload.map]);
    });


  /* DEBUG: Visualize store state as JSON */
  state$: Observable<GameState> = this.store.select((state) => state.gameState);

  constructor(public store: Store<AppState>,
              private router: Router,
              private actions$: Actions,
              public loadingService: LoadingService) {


    router.events
    // Filter only starts and ends.
      .filter(e => isStart(e) || isEnd(e))
      // Returns Observable<boolean>.
      .map(e => isStart(e))
      // Skips duplicates, so two 'true' values are never emitted in a row.
      .distinctUntilChanged()
      .subscribe(loading => {
        this.loadingService.loading = loading;
      });
  }

  private _debugRouterEvents() {
    // Groups all events by id and returns Observable<Observable<Event>>.
    this.router.events.groupBy(e => e.id).
    // Reduces events and returns Observable<Observable<Event[]>>.
    // The inner observable has only one element. map(collectAllEventsForNavigation).
    // Returns Observable<Event[]>.
    mergeAll().subscribe((es: Event[]) => {
      console.log("navigation events", es);
    });
  }
}

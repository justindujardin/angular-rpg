/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router, Event, NavigationStart, NavigationCancel, NavigationError} from '@angular/router';
import {LoadingService} from './components/loading/loading.service';
import {Store} from '@ngrx/store';
import {AppState} from './app.model';

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

  constructor(public store: Store<AppState>,
              private router: Router,
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
    mergeAll().subscribe((es) => {
      console.log("navigation events", es);
    });
  }
}

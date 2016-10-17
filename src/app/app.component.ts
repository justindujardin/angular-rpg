/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router, NavigationStart, NavigationCancel, NavigationError} from '@angular/router';
import {LoadingService} from './components/loading/loading.service';
import {Observable} from 'rxjs/Rx';
import {ItemState} from './models/item/item.reducer';
import {Store} from '@ngrx/store';
import {AppState} from './reducers/index';

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

  items$: Observable<ItemState> = this.appState.select<ItemState>('items');

  constructor(public appState: Store<AppState>,
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
}

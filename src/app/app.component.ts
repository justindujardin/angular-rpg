/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation} from '@angular/core';
import {AppState} from './app.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.style.scss'
  ],
  template: require('./app.html')
})
export class App {
  constructor(public appState: AppState) {
  }
  ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }
}

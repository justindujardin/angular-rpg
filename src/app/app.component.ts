import {Component, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from './app.model';

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  // styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public store: Store<AppState>) {
  }
}

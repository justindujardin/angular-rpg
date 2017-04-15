import {Component, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from './app.model';
import {GameWorld} from './services/game-world';
import {NotificationService} from './components/notification/notification.service';

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  // styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public store: Store<AppState>,
              public world: GameWorld,
              public notifications: NotificationService) {
    // TODO: Should the app component be responsible for setting up notifications?
    // Maybe notification service should not need to be in the world, and should
    // use setTimeout rather than rAF updates.
    this.world.time.addObject(notifications);
    this.world.mark(notifications);
  }
}

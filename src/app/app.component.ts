import {Component, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from './app.model';
import {GameWorld} from './services/game-world';
import {NotificationService} from './components/notification/notification.service';

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public store: Store<AppState>,
              public world: GameWorld,
              public notifications: NotificationService) {
    // TODO: Game "creation" here, or state update from stored file.
    //  - "create" will setup the ngrx/store for a new game file. It will download the latest game data from
    //    the source, load sprite metadata files from disk, initialize the current map and cache it. This is
    //    relatively expensive, but we can show some cool "initializing game" distractions to make it fun.
    //  - "state update" is the fast load path for games that have been saved and are being resumed. The entirety
    //    of the game data is loaded directly from a serialized JSON blob. This should avoid a bunch of network
    //    requests, and hopefully bring the game back very quickly on load.

    // TODO: Should the app component be responsible for setting up notifications?
    // Maybe notification service should not need to be in the world, and should
    // use setTimeout rather than rAF updates.
    this.world.time.addObject(notifications);
    this.world.mark(notifications);
  }
}

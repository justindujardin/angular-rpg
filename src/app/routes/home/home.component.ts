import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NotificationService} from '../../components/notification/notification.service';
import {RPGGame} from '../../services/rpg-game';
import {GameWorld} from '../../services/game-world';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {SpriteRender} from '../../services/sprite-render';
import {GameStateService} from '../../models/game-state/game-state.service';
import {LoadingService} from '../../components/loading/loading.service';

@Component({
  selector: 'home',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  constructor(public game: RPGGame,
              public notify: NotificationService,
              public world: GameWorld,
              public store: Store<AppState>,
              public sprites: SpriteRender,
              public loadingService: LoadingService,
              public gameStateService: GameStateService) {
  }

  ngOnInit() {
    this.loadingService.loading = false;
  }

}

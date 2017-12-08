import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {NotificationService} from '../../components/notification/notification.service';
import {RPGGame} from '../../services/rpg-game';
import {GameWorld} from '../../services/game-world';
import {SPREADSHEET_ID} from '../../models/game-data/game-data.model';
import {GameDataFetchAction} from '../../models/game-data/game-data.actions';
import {SpritesLoadAction} from '../../models/sprites/sprites.actions';
import {GameStateLoadAction} from '../../models/game-state/game-state.actions';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {SpriteRender} from '../../services/sprite-render';
import {GameStateService} from '../../models/game-state/game-state.service';

@Component({
  selector: 'game',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  constructor(public game: RPGGame,
              public notify: NotificationService,
              public world: GameWorld,
              public store: Store<AppState>,
              public sprites: SpriteRender,
              public gameStateService: GameStateService) {
  }

  ngOnInit() {
    if (this.gameStateService.hasSaveGame()) {
      this.store.dispatch(new GameStateLoadAction());
    }
    else {
      this.store.dispatch(new SpritesLoadAction('assets/images/index.json'));
      this.store.dispatch(new GameDataFetchAction(SPREADSHEET_ID));
      this.world.ready$.take(1).subscribe(() => {
        this.game.initGame().then((newGame: boolean) => {
          if (newGame) {
            const msgs: string[] = [
              'Click, Touch, or use the Arrow Keys.'
            ];
            msgs.forEach((m: string) => this.notify.show(m, null, 0));
          }
        }).catch(console.error.bind(console));
      });
    }

  }

}

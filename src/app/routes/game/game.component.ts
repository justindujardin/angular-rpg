import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {NotificationService} from '../../components/notification/notification.service';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';

@Component({
  selector: 'game',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  constructor(public game: RPGGame,
              public notify: NotificationService,
              public world: GameWorld) {
  }

  ngOnInit() {
    this.game.initGame().then((newGame: boolean) => {
      if (newGame) {
        const msgs: string[] = [
          'Urrrrrgh.', 'What is this?',
          'Oh well, it\'s probably not important.',
          'I better take a look around'
        ];
        msgs.forEach((m: string) => this.notify.show(m, null, 0));
      }
    }).catch(console.error.bind(console));
  }

}

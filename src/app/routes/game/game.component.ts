import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NotificationService } from '../../components/notification/notification.service';
import { GameWorld } from '../../services/game-world';
import { RPGGame } from '../../services/rpg-game';

@Component({
  selector: 'game',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  constructor(
    public game: RPGGame,
    public notify: NotificationService,
    public world: GameWorld
  ) {}

  ngOnInit() {
    this.game
      .initGame()
      .then((newGame: boolean) => {
        if (newGame) {
          const msgs: string[] = ['Click, Touch, or use the Arrow Keys.'];
          msgs.forEach((m: string) => this.notify.show(m, undefined, 0));
        }
      })
      .catch(console.error.bind(console));
  }
}

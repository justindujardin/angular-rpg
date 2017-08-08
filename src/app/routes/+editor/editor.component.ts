import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {NotificationService} from '../../components/notification/notification.service';
import {RPGGame} from '../../services/rpg-game';
import {GameWorld} from '../../services/game-world';

@Component({
  selector: 'editor',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit {
  constructor(public game: RPGGame,
              public notify: NotificationService,
              public world: GameWorld) {
  }

  ngOnInit() {
    console.log("the +editor is loaded. shipit.");
  }

}

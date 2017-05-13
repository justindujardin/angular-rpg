import {Component, Input} from '@angular/core';
import {RPGGame} from '../../services/index';
import {HeroModel} from '../../../game/rpg/models/all';

@Component({
  selector: 'player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})
export class PlayerCardComponent {
  @Input()
  model: any; // TODO: Revisit this with Entity type when model refactor is finishing up

  constructor(public game: RPGGame) {
  }

  getPlayerCSSClassMap(): any {
    return {
      dead: this.model && this.model.hp <= 0
    };
  }

  getCSSProgressWidth(): number {
    let width = 0;
    if (this.model) {
      width = (this.model.exp - this.model.prevLevelExp) / (this.model.nextLevelExp - this.model.prevLevelExp) * 100;
    }
    return Math.round(width);
  }
}

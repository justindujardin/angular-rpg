import {Component, Input} from '@angular/core';
import {RPGGame} from '../../services/index';
import {HeroModel} from '../../../game/rpg/models/all';
import {PartyMember} from '../../models/entity/entity.model';

@Component({
  selector: 'player-card',
  templateUrl: 'player-card.component.html'
})
export class PlayerCardComponent {
  @Input()
  model: PartyMember;

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

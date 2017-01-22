import {Component} from "@angular/core";
import {RPGGame} from "../../services/index";
import {HeroModel} from "../../../game/rpg/models/all";

@Component({
  selector: 'player-card',
  inputs: ['model'],
  templateUrl: 'player-card.component.html'
})
export class PlayerCard {
  model: HeroModel;

  constructor(public game: RPGGame) {
  }

  getPlayerCSSClassMap(): any {
    return {
      dead: this.model && this.model.attributes.hp <= 0
    }
  }

  getCSSProgressWidth(): number {
    var width = 0;
    if (this.model) {
      width = (this.model.attributes.exp - this.model.attributes.prevLevelExp) / (this.model.attributes.nextLevelExp - this.model.attributes.prevLevelExp) * 100;
    }
    return Math.round(width);
  }
}

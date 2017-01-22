import {Component} from "@angular/core";
import {RPGGame, NotificationService} from "../../services/index";

@Component({
  selector: 'party-menu',
  inputs: ['game', 'page', 'open'],
  styleUrls: ['party-menu.component.scss'],
  templateUrl: 'party-menu.component.html'
})
export class PartyMenu {
  page: string = 'party';
  open: boolean = false;

  toggle() {
    this.open = !this.open;
  }

  getActiveClass(type: string): any {
    return {
      active: type === this.page
    };
  }

  showParty() {
    this.page = 'party';
  }

  showSave() {
    this.page = 'save';
  }

  showInventory() {
    this.page = 'inventory';
  }

  menuResetGame() {
    this.game.resetGame();
    this.notify.show('Game data deleted.  Next time you refresh you will begin a new game.');
  }

  menuSaveGame() {
    this.game.saveGame();
    this.notify.show('Game state saved!  Nice.');
  }

  constructor(public game: RPGGame, public notify: NotificationService) {

  }

}

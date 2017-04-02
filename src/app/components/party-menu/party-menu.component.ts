import {Component, Input} from '@angular/core';
import {RPGGame, NotificationService} from '../../services/index';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getGamePartyGold, getGameParty} from '../../models/selectors';
import {BaseEntity} from '../../models/base-entity';
import {Entity} from '../../models/entity/entity.model';
import {GameStateSaveAction} from '../../models/game-state/game-state.actions';

@Component({
  selector: 'party-menu',
  styleUrls: ['party-menu.component.scss'],
  templateUrl: 'party-menu.component.html'
})
export class PartyMenuComponent {
  @Input()
  page: string = 'party';
  @Input()
  open: boolean = false;

  partyGold$: Observable<number> = this.store.select(getGamePartyGold);
  party$: Observable<Entity[]> = this.store.select(getGameParty);

  toggle() {
    this.open = !this.open;
  }

  showParty() {
    this.page = 'party';
  }

  showInventory() {
    this.page = 'inventory';
  }

  menuResetGame() {
    // this.game.resetGame();
    this.notify.show('Game data deleted.  Next time you refresh you will begin a new game.');
  }

  menuSaveGame() {
    this.store.dispatch(new GameStateSaveAction());
  }

  constructor(public game: RPGGame,
              public store: Store<AppState>,
              public notify: NotificationService) {

  }

}

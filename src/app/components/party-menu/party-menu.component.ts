import {Component, Input} from '@angular/core';
import {NotificationService, RPGGame} from '../../services/index';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getGameParty, getGamePartyGold} from '../../models/selectors';
import {Entity} from '../../models/entity/entity.model';
import {GameStateDeleteAction, GameStateSaveAction} from '../../models/game-state/game-state.actions';
import * as Immutable from 'immutable';
import {animate, style, transition, trigger} from '@angular/animations';
import {GameStateService} from '../../models/game-state/game-state.service';

export type PartyMenuStates = 'party' | 'inventory' | 'settings';

@Component({
  selector: 'party-menu',
  styleUrls: ['party-menu.component.scss'],
  templateUrl: 'party-menu.component.html',
  animations: [
    trigger(
      'card', [
        transition(':enter', [
          style({transform: 'translateY(100%)'}),
          animate('110ms', style({transform: 'translateY(0)'}))
        ]),
        transition(':leave', [
          style({transform: 'translateY(0)'}),
          animate('110ms', style({transform: 'translateY(100%)'}))
        ])
      ]
    ),
    trigger(
      'toolbar', [
        transition(':enter', [
          style({transform: 'translateY(-100%)'}),
          animate('110ms', style({transform: 'translateY(0)'}))
        ]),
        transition(':leave', [
          style({transform: 'translateY(0)'}),
          animate('110ms', style({transform: 'translateY(-100%)'}))
        ])
      ]
    ),
    trigger(
      'fab', [
        transition(':enter', [
          style({transform: 'translateY(100%)'}),
          animate('110ms', style({transform: 'translateY(0)'}))
        ]),
        transition(':leave', [
          style({transform: 'translateY(0)'}),
          animate('110ms', style({transform: 'translateY(100%)'}))
        ])
      ]
    )
  ]
})
export class PartyMenuComponent {
  @Input()
  page: PartyMenuStates = 'party';
  @Input()
  open: boolean = false;

  partyGold$: Observable<number> = this.store.select(getGamePartyGold);
  party$: Observable<Immutable.List<Entity>> = this.store.select(getGameParty);

  resetGame() {
    this.store.dispatch(new GameStateDeleteAction());
  }

  saveGame() {
    this.store.dispatch(new GameStateSaveAction());
  }

  constructor(public game: RPGGame,
              public store: Store<AppState>,
              public gameStateService: GameStateService,
              public notify: NotificationService) {

  }

}

/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import * as _ from 'underscore';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit
} from '@angular/core';
import {TempleFeatureComponent} from '../../../game/rpg/components/features/templeFeatureComponent';
import {HeroModel} from '../../../game/rpg/models/all';
import {GameStateModel} from '../../../game/rpg/models/gameStateModel';
import {RPGGame, NotificationService} from '../../services/index';
import {IScene} from '../../../game/pow2/interfaces/IScene';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {getGold, getParty, getGameState} from '../../models/game-state/game-state.reducer';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {GameState} from '../../models/game-state/game-state.model';
import {GameStateHealPartyAction} from '../../models/game-state/game-state.actions';
import {PartyMember} from "../../models/party/party.model";

@Component({
  selector: 'world-temple',
  styleUrls: ['./world-temple.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './world-temple.component.html'
})
export class WorldTemple implements OnInit, OnDestroy {
  @Output() onClose = new EventEmitter();

  @Input() scene: IScene;

  partyGold$: Observable<number> = getGold(this.store);
  party$: Observable<PartyMember[]> = getParty(this.store);

  private _name$ = new BehaviorSubject<string>('Mystery Temple');
  name$: Observable<string> = this._name$;

  @Input() set name(value: string) {
    this._name$.next(value);
  }

  private _icon$ = new BehaviorSubject<string>(null);
  icon$: Observable<string> = this._icon$;

  @Input() set icon(value: string) {
    this._icon$.next(value);
  }

  private _cost$ = new BehaviorSubject<number>(200);
  cost$: Observable<number> = this._cost$;

  @Input() set cost(value: number) {
    this._cost$.next(value);
  }

  @Input() party: PartyMember[];


  @Input()
  set feature(feature: TempleFeatureComponent) {
    this.name = feature.name;
    this.icon = feature.icon;
    this.cost = parseInt(feature.cost);
  }

  constructor(public game: RPGGame,
              public store: Store<AppState>,
              public notify: NotificationService) {
  }

  private _onRest$ = new Subject<void>();
  private _onRestSubscription$: Subscription;

  ngOnInit(): void {
    this._onRestSubscription$ = this._onRest$
      .switchMap(() => getGameState(this.store).withLatestFrom(this.cost$))
      .do((tuple: any) => {
        const gameState: GameState = tuple[0];
        const cost: number = tuple[1];
        const alreadyHealed: boolean = !_.find(gameState.party, (p: PartyMember) => {
          return p.hp !== p.maxhp;
        });
        if (cost > gameState.gold) {
          this.notify.show("You don't have enough money");
        }
        else if (alreadyHealed) {
          this.notify.show("Keep your money.\nYour party is already fully healed.");
        }
        else {
          this.store.dispatch(new GameStateHealPartyAction(cost));
          this.notify.show("Your party has been healed! \nYou have (" + (gameState.gold - cost) + ") monies.", null, 2500);
        }
        _.defer(() => {
          this.onClose.next({});
        });
      }).subscribe();
  }

  ngOnDestroy(): void {
    this._onRestSubscription$.unsubscribe();
  }


}

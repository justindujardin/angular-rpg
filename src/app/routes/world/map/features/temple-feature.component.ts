import {TiledFeatureComponent, TiledMapFeatureData} from '../map-feature.component';
import _ from 'underscore';
import {
  Component,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {RPGGame} from '../../../../services/rpg-game';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.model';
import {NotificationService} from '../../../../components/notification/notification.service';
import {getGamePartyGold, getGameParty} from '../../../../models/selectors';
import {Entity} from '../../../../models/entity/entity.model';
import {IScene} from '../../../../../game/pow2/scene/scene.model';
import {GameStateHealPartyAction} from '../../../../models/game-state/game-state.actions';
import * as Immutable from 'immutable';

@Component({
  selector: 'temple-feature',
  styleUrls: ['./temple-feature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './temple-feature.component.html'
})
export class TempleFeatureComponent extends TiledFeatureComponent implements OnInit, OnDestroy {
  @Output() onClose = new EventEmitter();
  @Input() scene: IScene;
  @Input() active: boolean;
  @Input() party: Entity[];
  @Input() feature: TiledMapFeatureData;
  active$: Observable<boolean>;

  partyGold$: Observable<number> = this.store.select(getGamePartyGold);
  party$: Observable<Immutable.List<Entity>> = this.store.select(getGameParty);

  name$: Observable<string> = this.feature$.map((data: TiledMapFeatureData) => {
    return data.properties.name;
  });

  icon$: Observable<string> = this.feature$.map((data: TiledMapFeatureData) => {
    return data.properties.icon;
  });

  cost$: Observable<number> = this.feature$.map((data: TiledMapFeatureData) => {
    return parseInt(data.properties.cost, 10);
  });

  constructor(public game: RPGGame,
              public store: Store<AppState>,
              public notify: NotificationService) {
    super();
  }

  public _onRest$ = new Subject<void>();
  private _onRestSubscription$: Subscription;

  ngOnInit(): void {
    this._onRestSubscription$ = this._onRest$.withLatestFrom(this.party$, this.partyGold$, this.cost$,
      (evt, party: Immutable.List<Entity>, partyGold: number, cost: number) => {
        const alreadyHealed: boolean = !party.find((p: Entity) => {
          console.log(p, RPGGame.getHPForLevel(1, p));
          return p.hp !== p.maxhp;
        });
        if (cost > partyGold) {
          this.notify.show('You don\'t have enough money');
        }
        else if (alreadyHealed) {
          this.notify.show('Keep your money.\nYour party is already fully healed.');
        }
        else {
          const partyIds: string[] = party.map((p) => p.eid).toArray();
          this.store.dispatch(new GameStateHealPartyAction({
            cost,
            partyIds
          }));
          const msg = 'Your party has been healed! \nYou have (' + (partyGold - cost) + ') monies.';
          this.notify.show(msg, null, 5000);
        }
        _.defer(() => {
          this.onClose.next({});
        });
      })
      .subscribe();
  }

  ngOnDestroy(): void {
    this._onRestSubscription$.unsubscribe();
  }
}

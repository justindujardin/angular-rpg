import * as _ from 'underscore';
import {TiledFeatureComponent, TiledMapFeatureData} from '../map-feature.component';
import {TileObject} from '../../../../../game/pow2/tile/tileObject';
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
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {RPGGame} from '../../../../services/rpgGame';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.model';
import {NotificationService} from '../../../../components/notification/notification.service';
import {sliceGameState, getGamePartyGold, getGameParty} from '../../../../models/selectors';
import {GameState} from '../../../../models/game-state/game-state.model';
import {Entity} from '../../../../models/entity/entity.model';
import {GameStateHealPartyAction} from '../../../../models/game-state/game-state.actions';
import {IScene} from '../../../../../game/pow2/interfaces/IScene';
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

  private _active$ = new BehaviorSubject<boolean>(false);
  active$: Observable<boolean> = this._active$;

  @Input()
  set active(value: boolean) {
    this._active$.next(value);
  }

  partyGold$: Observable<number> = this.store.select(getGamePartyGold);
  party$: Observable<Entity[]> = this.store.select(getGameParty);

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

  @Input() party: Entity[];

  @Input() feature: TiledMapFeatureData;
  //
  // @Input()
  // set feature(feature: TempleFeatureComponent) {
  //   this.name = feature.name;
  //   this.icon = feature.icon;
  //   this.cost = parseInt(feature.cost, 10);
  // }

  constructor(public game: RPGGame,
              public store: Store<AppState>,
              public notify: NotificationService) {
    super();
  }

  public _onRest$ = new Subject<void>();
  private _onRestSubscription$: Subscription;

  ngOnInit(): void {
    this._onRestSubscription$ = this._onRest$
      .switchMap(() => this.store.select(sliceGameState).withLatestFrom(this.cost$))
      .do((tuple: any) => {
        const gameState: GameState = tuple[0];
        const cost: number = tuple[1];
        const alreadyHealed: boolean = !_.find(gameState.party, (p: Entity) => {
          return p.hp !== p.maxhp;
        });
        if (cost > gameState.gold) {
          this.notify.show('You don\'t have enough money');
        }
        else if (alreadyHealed) {
          this.notify.show('Keep your money.\nYour entity is already fully healed.');
        }
        else {
          this.store.dispatch(new GameStateHealPartyAction(cost));
          const msg = 'Your entity has been healed! \nYou have (' + (gameState.gold - cost) + ') monies.';
          this.notify.show(msg, null, 2500);
        }
        _.defer(() => {
          this.onClose.next({});
        });
      }).subscribe();
  }

  ngOnDestroy(): void {
    this._onRestSubscription$.unsubscribe();
  }

  enter(object: TileObject): boolean {
    this.active = true;
    return true;
  }

  exit(object: TileObject): boolean {
    this.active = false;
    return true;
  }

}

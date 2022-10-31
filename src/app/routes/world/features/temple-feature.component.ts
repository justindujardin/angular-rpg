import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import * as Immutable from 'immutable';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import * as _ from 'underscore';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { Entity } from '../../../models/entity/entity.model';
import { GameStateHealPartyAction } from '../../../models/game-state/game-state.actions';
import { getGameParty, getGamePartyGold } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { MapFeatureComponent } from '../map-feature.component';

@Component({
  selector: 'temple-feature',
  styleUrls: ['./temple-feature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './temple-feature.component.html',
})
export class TempleFeatureComponent
  extends MapFeatureComponent
  implements OnInit, OnDestroy
{
  @Input() feature: ITiledObject | null = null;
  @Output() onClose = new EventEmitter();
  @Input() party: Entity[];

  partyGold$: Observable<number> = this.store.select(getGamePartyGold);
  party$: Observable<Immutable.List<Entity | undefined>> =
    this.store.select(getGameParty);

  name$: Observable<string> = this.feature$.pipe(
    map((data: ITiledObject | null) => {
      return data?.name || 'temple';
    })
  );

  icon$: Observable<string> = this.feature$.pipe(
    map((data: ITiledObject | null) => {
      return data?.properties?.icon;
    })
  );

  cost$: Observable<number> = this.feature$.pipe(
    map((data: ITiledObject | null) => {
      return parseInt(data?.properties?.cost, 10);
    })
  );

  public _onRest$ = new Subject<void>();
  private _onRestSubscription$: Subscription;

  ngOnInit(): void {
    this._onRestSubscription$ = this._onRest$
      .pipe(
        withLatestFrom(
          this.party$,
          this.partyGold$,
          this.cost$,
          (evt, party: Immutable.List<Entity>, partyGold: number, cost: number) => {
            const alreadyHealed: boolean = !party.find((p: Entity) => {
              return p.hp !== p.maxhp;
            });
            if (cost > partyGold) {
              this.notify.show("You don't have enough money");
            } else if (alreadyHealed) {
              this.notify.show('Keep your money.\nYour party is already fully healed.');
            } else {
              const partyIds: string[] = party
                .map((p) => {
                  assertTrue(p, 'invalid player entity in party');
                  return p.eid;
                })
                .toArray();
              this.store.dispatch(
                new GameStateHealPartyAction({
                  cost,
                  partyIds,
                })
              );
              const msg =
                'Your party has been healed! \nYou have (' +
                (partyGold - cost) +
                ') monies.';
              this.notify.show(msg, undefined, 5000);
            }
            _.defer(() => {
              this.onClose.next({});
            });
          }
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._onRestSubscription$.unsubscribe();
  }
}

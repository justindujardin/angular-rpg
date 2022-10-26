import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  awardExperience,
  diffPartyMember,
  IPartyStatsDiff,
} from 'app/models/mechanics';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { IPartyMember } from '../../models/base-entity';
import {
  CombatVictoryAction,
  CombatVictorySummary,
} from '../../models/combat/combat.actions';
import { Entity } from '../../models/entity/entity.model';
import { GameStateTravelAction } from '../../models/game-state/game-state.actions';
import { GameStateService } from '../../models/game-state/game-state.service';
import { getXPForLevel } from '../../models/levels';
import { getGameParty } from '../../models/selectors';
import { RPGGame } from '../../services/rpg-game';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'debug-menu',
  styleUrls: ['debug-menu.component.scss'],
  templateUrl: 'debug-menu.component.html',
  animations: [
    trigger('toolbar', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('110ms', style({ transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)' }),
        animate('110ms', style({ transform: 'translateY(-100%)' })),
      ]),
    ]),
  ],
})
export class DebugMenuComponent {
  @Input()
  open: boolean = false;

  /** Possible locations for travel */
  locations: { map: string; x?: number; y?: number }[] = [
    { map: 'castle' },
    { map: 'crypt' },
    { map: 'fortress1', x: 21, y: 15 },
    { map: 'fortress2' },
    { map: 'isle', x: 14, y: 7 },
    { map: 'keep' },
    { map: 'lair' },
    { map: 'port' },
    { map: 'ruins', x: 13, y: 20 },
    { map: 'sewer' },
    { map: 'tower1' },
    { map: 'tower2' },
    { map: 'tower3' },
    { map: 'town' },
    { map: 'village', x: 5, y: 10 },
    { map: 'wilderness' },
  ];
  party$: Observable<Immutable.List<Entity>> = this.store.select(getGameParty);

  /** Award level ups to each character in the party */
  levelUp() {
    this.party$
      .pipe(
        first(),
        map((party: Immutable.List<Entity>) => {
          // Award experience
          //
          const levelUps: IPartyStatsDiff[] = [];
          let gainedXp = 0;
          const newParty: IPartyMember[] = party
            .map((player: Entity) => {
              const nextLevel: number = getXPForLevel(player.level + 1) - player.exp;
              gainedXp += nextLevel;
              let result = awardExperience(nextLevel + 1, player);
              levelUps.push(diffPartyMember(player, result));
              return result;
            })
            .toJS();

          // Dispatch victory action
          const summary: CombatVictorySummary = {
            type: 'random',
            id: '',
            party: newParty,
            enemies: [],
            levels: levelUps,
            items: [],
            gold: 0,
            exp: gainedXp,
          };
          this.store.dispatch(new CombatVictoryAction(summary));
        })
      )
      .subscribe();
  }

  /** Travel to a given location in the game */
  travel(event: any) {
    const { map, x = 12, y = 5 } = this.locations.find((l) => l.map === event.value);
    this.store.dispatch(
      new GameStateTravelAction({
        location: map,
        position: { x, y },
      })
    );
  }

  constructor(
    public game: RPGGame,
    public store: Store<AppState>,
    public gameStateService: GameStateService,
    public notify: NotificationService
  ) {}
}

import { animate, style, transition, trigger } from '@angular/animations';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyTabChangeEvent as MatTabChangeEvent } from '@angular/material/legacy-tabs';
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
import { ARMOR_DATA } from '../../models/game-data/armors';
import { ENEMIES_DATA } from '../../models/game-data/enemies';
import {
  ITemplateBaseItem,
  ITemplateEnemy,
} from '../../models/game-data/game-data.model';
import { ITEMS_DATA } from '../../models/game-data/items';
import { MAGIC_DATA } from '../../models/game-data/magic';
import { WEAPONS_DATA } from '../../models/game-data/weapons';
import {
  GameStateAddGoldAction,
  GameStateTravelAction,
} from '../../models/game-state/game-state.actions';
import { GameStateService } from '../../models/game-state/game-state.service';
import { getXPForLevel } from '../../models/levels';
import { getGameMap, getGameParty } from '../../models/selectors';
import { RPGGame } from '../../services/rpg-game';
import { NotificationService } from '../notification/notification.service';

type DataSourceTypes = ITemplateBaseItem | ITemplateEnemy;

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
    trigger('table', [
      transition(':enter', [
        style({ bottom: '-2000px' }),
        animate('110ms', style({ bottom: '0' })),
      ]),
      transition(':leave', [
        style({ bottom: '0' }),
        animate('110ms', style({ bottom: '-2000px' })),
      ]),
    ]),
  ],
})
export class DebugMenuComponent implements AfterViewInit {
  @Input()
  open: boolean = false;

  /** Possible locations for travel */
  locations: { map: string; x?: number; y?: number }[] = [
    { map: 'castle', x: 16, y: 9 },
    { map: 'crypt', x: 5, y: 28 },
    { map: 'fortress1', x: 21, y: 15 },
    { map: 'fortress2', x: 22, y: 12 },
    { map: 'isle', x: 14, y: 7 },
    { map: 'keep', x: 11, y: 16 },
    { map: 'lair', x: 14, y: 45 },
    { map: 'port', x: 20, y: 5 },
    { map: 'ruins', x: 13, y: 20 },
    { map: 'sewer', x: 20, y: 1 },
    { map: 'tower1', x: 6, y: 9 },
    { map: 'tower2', x: 4, y: 15 },
    { map: 'tower3', x: 2, y: 1 },
    { map: 'town', x: 12, y: 5 },
    { map: 'village', x: 5, y: 10 },
    { map: 'wilderness', x: 19, y: 46 },
  ];
  party$: Observable<Immutable.List<Entity | undefined>> =
    this.store.select(getGameParty);
  gameMap$: Observable<string> = this.store.select(getGameMap);
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<DataSourceTypes> = new MatTableDataSource([]);

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    const currentData = WEAPONS_DATA;
    this.dataSource = new MatTableDataSource(currentData);
    this.displayedColumns = Object.keys(currentData[0]);
    this.dataSource.sort = this.sort;
  }
  tabChange(event: MatTabChangeEvent) {
    let data: DataSourceTypes[] = [];
    switch (event.tab.textLabel.toLowerCase()) {
      case 'armors':
        data = ARMOR_DATA;
        break;
      case 'items':
        data = ITEMS_DATA;
        break;
      case 'magics':
        data = MAGIC_DATA;
        break;
      case 'weapons':
        data = WEAPONS_DATA;
        break;
      case 'enemies':
        data = ENEMIES_DATA;
        break;
    }
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.displayedColumns = Object.keys(data[0]);
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  /** Give the player some gold */
  giveGold() {
    this.store.dispatch(new GameStateAddGoldAction(1000));
  }

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
    const data = this.locations.find((l) => l.map === event.value);
    const { map = '', x = 12, y = 5 } = data || {};
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
    public notify: NotificationService,
    private _liveAnnouncer: LiveAnnouncer
  ) {}
}

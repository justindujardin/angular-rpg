import {Component, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {Notify} from '../../services/notify';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Rx';
import {ActivatedRoute} from '@angular/router';
import {GameState} from '../../models/game-state/game-state.model';
import {GameTileMap} from '../../../game/gameTileMap';
import {PartyMember} from '../../models/party-member.model';
import {HeroModel} from '../../../game/rpg/models/heroModel';
import {IPoint} from '../../../game/pow-core';
import * as Immutable from 'immutable';

@Component({
  selector: 'world',
  styleUrls: ['./world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './world.component.html'
})
export class WorldComponent {

  map$ = this.route.data.pluck('world') as Observable<GameTileMap>;

  zone$: Observable<string> = this.store
    .select((s) => s.gameState)
    .map((s: GameState) => {
      return s.map
    })
    .filter(v => !!v)
    .distinctUntilChanged();

  position$: Observable<IPoint> = this.store
    .select((s) => s.gameState)
    .map((s: GameState) => {
      return Immutable.Map(s.position).toJS()
    })
    .distinctUntilChanged();

  partyLeader$: Observable<HeroModel> = this.store
    .select((s) => s.gameState.party)
    // TODO: Convert to HeroModel (until ready to deprecate fully)
    .map((party: PartyMember[]) => {
      return new HeroModel(party[0]);
    });

  constructor(public route: ActivatedRoute,
              public game: RPGGame,
              public notify: Notify,
              public store: Store < AppState >,
              public world: GameWorld) {
  }

}

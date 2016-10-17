import {Component, ViewEncapsulation} from '@angular/core';
import {Notify} from '../../services/notify';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Rx';
import {ActivatedRoute} from '@angular/router';
import {GameState} from '../../models/game-state/game-state.model';
import {GameTileMap} from '../../../game/gameTileMap';

@Component({
  selector: 'world',
  styleUrls: ['./world.component.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './world.component.html'
})
export class WorldComponent {

  map$ = this.route.data.pluck('world') as Observable<GameTileMap>;

  currentZone$: Observable<string> = this.store
    .select((s) => s.gameState)
    .map((s: GameState) => {
      return s.map
    })
    .filter(v => !!v)
    .distinctUntilChanged();

  constructor(public route: ActivatedRoute,
              public game: RPGGame,
              public notify: Notify,
              public store: Store < AppState >,
              public world: GameWorld) {
  }

}

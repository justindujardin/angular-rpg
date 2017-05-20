import {GameStateModel} from '../../game/rpg/models/gameStateModel';
import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {ResourceManager} from '../../game/pow-core/resource-manager';
import {PowInput} from '../../game/pow2/core/input';
import {World} from '../../game/pow-core/world';
import {SpriteRender} from './sprite-render';
import {AppState} from '../app.model';
import {Store} from '@ngrx/store';
import {SPREADSHEET_ID} from '../models/game-data/game-data.model';
import {GameDataFetchAction} from '../models/game-data/game-data.actions';
import {SpritesLoadAction} from '../models/sprites/sprites.actions';
import {GameStateService} from '../models/game-state/game-state.service';
import {GameStateLoadAction} from '../models/game-state/game-state.actions';
import {getGameDataLoaded, getSpritesLoaded} from '../models/selectors';

let _sharedGameWorld: GameWorld = null;

@Injectable()
export class GameWorld extends World {
  input: PowInput = new PowInput();

  /**
   * Observable that emits when all game data has been loaded and the game can start.
   */
  ready$: Observable<void> = this.store.select(getSpritesLoaded)
    .combineLatest(this.store.select(getGameDataLoaded), (sprites: boolean, data: boolean) => {
      // are both tables loaded?
      return sprites && data;
    })
    .filter((b) => b)
    .map(() => undefined);

  constructor(public loader: ResourceManager,
              public store: Store<AppState>,
              public sprites: SpriteRender,
              public gameStateService: GameStateService) {
    super();
    _sharedGameWorld = this;
    if (this.gameStateService.hasSaveGame()) {
      this.store.dispatch(new GameStateLoadAction());
    }
    else {
      this.store.dispatch(new SpritesLoadAction('assets/images/index.json'));
      this.store.dispatch(new GameDataFetchAction(SPREADSHEET_ID));
    }
  }

  static get(): GameWorld {
    return _sharedGameWorld;
  }
}

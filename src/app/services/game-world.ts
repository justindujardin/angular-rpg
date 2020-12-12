import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ResourceManager } from '../../game/pow-core/resource-manager';
import { World } from '../../game/pow-core/world';
import { PowInput } from '../../game/pow2/core/input';
import { AppState } from '../app.model';
import { GameDataFetchAction } from '../models/game-data/game-data.actions';
import { SPREADSHEET_ID } from '../models/game-data/game-data.model';
import { GameStateLoadAction } from '../models/game-state/game-state.actions';
import { GameStateService } from '../models/game-state/game-state.service';
import { getGameDataLoaded, getSpritesLoaded } from '../models/selectors';
import { SpritesLoadAction } from '../models/sprites/sprites.actions';
import { SpriteRender } from './sprite-render';

let _sharedGameWorld: GameWorld = null;

@Injectable()
export class GameWorld extends World {
  input: PowInput = new PowInput();

  /**
   * Observable that emits when all game data has been loaded and the game can start.
   */
  ready$: Observable<void> = combineLatest(
    this.store.select(getSpritesLoaded),
    this.store.select(getGameDataLoaded)
  ).pipe(
    map(([spritesLoaded, dataLoaded]) => {
      // are both tables loaded?
      return spritesLoaded && dataLoaded;
    }),
    filter((b) => b),
    map(() => undefined)
  );

  constructor(
    public loader: ResourceManager,
    public store: Store<AppState>,
    public sprites: SpriteRender,
    public gameStateService: GameStateService
  ) {
    super();
    _sharedGameWorld = this;
    if (this.gameStateService.hasSaveGame()) {
      this.store.dispatch(new GameStateLoadAction());
      // this.store.dispatch(new GameDataClearAction());
      // this.store.dispatch(new GameDataFetchAction(SPREADSHEET_ID));
    } else {
      this.store.dispatch(new SpritesLoadAction('assets/images/index.json'));
      this.store.dispatch(new GameDataFetchAction(SPREADSHEET_ID));
    }
  }

  static get(): GameWorld {
    return _sharedGameWorld;
  }
}

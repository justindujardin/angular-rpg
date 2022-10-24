import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from 'environments/environment';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ResourceManager } from '../../app/core/resource-manager';
import { World } from '../../app/core/world';
import { AppState } from '../app.model';
import { PowInput } from '../core/input';
import { GameStateLoadAction } from '../models/game-state/game-state.actions';
import { GameStateService } from '../models/game-state/game-state.service';
import { getSpritesLoaded } from '../models/selectors';
import { SpritesLoadAction } from '../models/sprites/sprites.actions';
import { SpriteRender } from './sprite-render';

let _sharedGameWorld: GameWorld = null;

@Injectable()
export class GameWorld extends World {
  input: PowInput = new PowInput();

  /**
   * Observable that emits when all game data has been loaded and the game can start.
   */
  ready$: Observable<void> = combineLatest(this.store.select(getSpritesLoaded)).pipe(
    map(([spritesLoaded]) => {
      // are both tables loaded?
      return spritesLoaded;
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
      if (environment.alwaysLoadSprites) {
        this.store.dispatch(new SpritesLoadAction('assets/images/index.json'));
      }
      this.store.dispatch(new GameStateLoadAction());
    } else {
      this.store.dispatch(new SpritesLoadAction('assets/images/index.json'));
    }
  }

  static get(): GameWorld {
    return _sharedGameWorld;
  }
}

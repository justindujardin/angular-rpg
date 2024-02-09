import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppState } from '../app.model';
import { NotificationService } from '../components/notification/notification.service';
import { AudioResource, ResourceManager, World } from '../core';
import { PowInput } from '../core/input';
import { GameStateLoadAction } from '../models/game-state/game-state.actions';
import { GameStateService } from '../models/game-state/game-state.service';
import { getSpritesLoaded } from '../models/selectors';
import { SpritesLoadAction } from '../models/sprites/sprites.actions';
import { SpriteRender } from './sprite-render';

let _sharedGameWorld: GameWorld | null = null;

@Injectable()
export class GameWorld extends World {
  input: PowInput = new PowInput();

  /**
   * Observable that emits when all game data has been loaded and the game can start.
   */
  ready$: Observable<void> = this.store.select(getSpritesLoaded).pipe(
    map((spritesLoaded: boolean) => {
      // are both tables loaded?
      return spritesLoaded;
    }),
    filter((b) => b),
    map(() => undefined),
  );

  constructor(
    public loader: ResourceManager,
    public store: Store<AppState>,
    public sprites: SpriteRender,
    public gameStateService: GameStateService,
    public notify: NotificationService,
  ) {
    super();
    _sharedGameWorld = this;
    this.store.dispatch(new SpritesLoadAction('assets/images/index.json'));
    if (this.gameStateService.hasSaveGame()) {
      this.store.dispatch(new GameStateLoadAction());
    }
  }

  static get(): GameWorld | null {
    return _sharedGameWorld;
  }

  private _music: AudioResource | null = null;

  /** Preload a sprite given its name */
  async preloadSprite(icon: string) {
    if (!icon) {
      return;
    }
    const meta = this.sprites.getSpriteMeta(icon);
    if (meta) {
      await this.sprites.getSpriteSheet(meta.source);
    }
  }

  /** Set the background music URL for the game */
  setMusic(musicUrl: string, loop: boolean = true, volume: number = 0.5) {
    // Setting to the same track, let it keep playing from where it is
    if (musicUrl === this._music?.url) {
      return;
    }
    if (!musicUrl) {
      if (this._music?.data) {
        this._music.data.pause();
        this._music = null;
      }
      return;
    }
    this.loader
      .load(musicUrl)
      .then((resources: AudioResource[]) => {
        const res = resources[0];
        if (this._music?.data) {
          this._music.data.pause();
          this._music = null;
        }
        this._music = res;
        if (this._music.data) {
          this._music.data.currentTime = 0;
          this._music.data.volume = volume;
          this._music.data.loop = loop;
          this._music.data.play();
        }
      })
      .catch((e) => {
        this.notify.show(`Failed to load music: ${musicUrl} with error: ${e}`);
      });
  }
}

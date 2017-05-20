import * as _ from 'underscore';
import {GameStateModel} from '../../game/rpg/models/gameStateModel';
import {GameDataResource} from '../models/game-data/game-data.resource';
import {registerSprites} from '../../game/pow2/core/api';
import {Subject} from 'rxjs/Subject';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {JSONResource} from '../../game/pow-core/resources/json.resource';
import {Injectable} from '@angular/core';
import {ResourceManager} from '../../game/pow-core/resource-manager';
import {PowInput} from '../../game/pow2/core/input';
import {World} from '../../game/pow-core/world';
import {SpriteRender} from './sprite-render';
import {AppState} from '../app.model';
import {Store} from '@ngrx/store';
import {SPREADSHEET_ID} from '../models/game-data/game-data.model';
import {GameDataAddSheetAction} from '../models/game-data/game-data.actions';
import {SpritesLoadAction} from '../models/sprites/sprites.actions';
import {GameStateService} from '../models/game-state/game-state.service';
import {GameStateLoadAction} from '../models/game-state/game-state.actions';

let _sharedGameWorld: GameWorld = null;

@Injectable()
export class GameWorld extends World {
  input: PowInput = new PowInput();

  /**
   * Subject that emits when the game world has been loaded and is
   * ready to be interacted with.
   */
  private _ready$: Subject<void> = new ReplaySubject<void>(1);
  ready$: Observable<void> = this._ready$;

  constructor(public loader: ResourceManager,
              public store: Store<AppState>,
              public sprites: SpriteRender,
              public gameStateService: GameStateService) {
    super();
    _sharedGameWorld = this;
    // TODO: This breaks HMR. Only init this data when creating a new game.
    // Preload sprite sheets
    if (this.gameStateService.hasSaveGame()) {
      this.store.dispatch(new GameStateLoadAction());
    }
    else {
      this.store.dispatch(new SpritesLoadAction('assets/images/index.json'));
      this.loadSprites()
        .then(() => this.loadGameData())
        .then(() => this._ready$.next())
        .catch((e) => console.error(e));
    }
  }

  static get(): GameWorld {
    return _sharedGameWorld;
  }

  /** Load game data from google spreadsheet */
  private loadGameData(): Promise<void> {
    return this.loader.loadAsType(SPREADSHEET_ID, GameDataResource).then((resource: GameDataResource) => {
      this.store.dispatch(new GameDataAddSheetAction('weapons', resource.data.weapons));
      this.store.dispatch(new GameDataAddSheetAction('armor', resource.data.armor));
      this.store.dispatch(new GameDataAddSheetAction('items', resource.data.items));
      this.store.dispatch(new GameDataAddSheetAction('enemies', resource.data.enemies));
      this.store.dispatch(new GameDataAddSheetAction('magic', resource.data.magic));
      this.store.dispatch(new GameDataAddSheetAction('classes', resource.data.classes));
      this.store.dispatch(new GameDataAddSheetAction('randomEncounters', resource.data.randomencounters));
      this.store.dispatch(new GameDataAddSheetAction('fixedEncounters', resource.data.fixedencounters));
    });
  }

  /** Preload sprite sheet metadata */
  private loadSprites(): Promise<void> {
    return this.loader.load('assets/images/index.json')
      .then((res: JSONResource[]) => {
        const jsonRes = res[0];
        const sources = _.map(jsonRes.data, (baseName: string) => {
          return `${baseName}.json`;
        });
        return Promise.all(_.map(sources, (fileName: string) => {
          return this.loader.load(fileName)
            .then((spritesLoaded: JSONResource[]) => {
              const meta = spritesLoaded[0];
              const name = meta.url
                .substr(0, meta.url.lastIndexOf('.'))
                .substr(meta.url.lastIndexOf('/') + 1);
              registerSprites(name, meta.data);
            });
        })).then(() => Promise.resolve<void>(undefined));
      });
  }
}

import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {ResourceLoader} from '../../../game/pow-core/resourceLoader';
import {TiledTMXResource} from '../../../game/pow-core/resources/tiled/tiledTmx';
import {getMapUrl} from '../../../game/pow2/core/api';
import {GameWorld} from '../../services/gameWorld';
import {GameTileMap} from '../../../game/gameTileMap';
import {GameState} from './game-state.model';

@Injectable()
export class GameStateService {

  constructor(private gameWorld: GameWorld, private loader: ResourceLoader) {
  }

  private _worldMap$ = new ReplaySubject<GameTileMap>(1);
  worldMap$: Observable<GameTileMap> = this._worldMap$;

  loadGame(from: GameState): Observable<GameState> {
    return Observable.of(from).debounceTime(100);
  }

  loadMap(name: string): Observable<GameTileMap> {
    const mapUrl = getMapUrl(name);
    return Observable.fromPromise(this.loader.load(mapUrl)
      .then((maps: TiledTMXResource[]) => {
        if (!maps[0] || !maps[0].data) {
          return Promise.reject('invalid resource: ' + mapUrl);
        }
        const inputs = {
          resource: maps[0]
        };
        return this.gameWorld.entities.createObject('GameMapObject', inputs);
      })
      .then((g: any) => {
        if (!g) {
          return Promise.reject('failed to load map: ' + mapUrl);
        }
        this._worldMap$.next(g);
        return g;
      }));
  }

}

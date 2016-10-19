import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {ResourceLoader} from '../../game/pow-core/resourceLoader';
import {TiledTMXResource} from '../../game/pow-core/resources/tiled/tiledTmx';
import {getMapUrl} from '../../game/pow2/core/api';
import {GameWorld} from './gameWorld';
import {GameTileMap} from '../../game/gameTileMap';

@Injectable()
export class GameResources {

  constructor(private gameWorld: GameWorld, private loader: ResourceLoader) {
  }

  loadMap(name: string): Observable<GameTileMap> {
    return Observable.fromPromise(this.loader.load(getMapUrl(name))
      .then((maps: TiledTMXResource[]) => {
        if (!maps[0] || !maps[0].data) {
          return Promise.reject('invalid resource: ' + getMapUrl(name));
        }
        return this.gameWorld.entities.createObject('GameMapObject', {
          resource: maps[0]
        });
      }));
  }

}

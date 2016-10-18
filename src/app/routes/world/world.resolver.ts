import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import 'rxjs/add/observable/of';
import {LoadingService} from '../../components/loading/loading.service';
import {GameWorld} from '../../services/gameWorld';
import {ResourceLoader} from '../../../game/pow-core/resourceLoader';
import {GameTileMap} from '../../../game/gameTileMap';
import {TiledTMXResource} from '../../../game/pow-core/resources/tiled/tiledTmx';

export interface WorldRouteData {

}

@Injectable()
export class WorldResolver implements Resolve<any> {

  constructor(private world: GameWorld,
              private loader: ResourceLoader,
              private loadingService: LoadingService) {

  }


  /**
   * Load a map by name as a [[Promise]].
   * @param value The map name, e.g. "keep" or "isle"
   * @private
   */
  protected _loadMap(value: string): Promise<GameTileMap> {
    if (!value) {
      return Promise.reject('Invalid map value: ' + value);
    }
    return this.loader.load(GameWorld.getMapUrl(value))
      .then((maps: TiledTMXResource[]) => {
        const map = maps[0];
        if (!map || !map.data) {
          return Promise.reject('invalid resource: ' + GameWorld.getMapUrl(value));
        }
        return this.world.entities.createObject('GameMapObject', {
          resource: map
        });
      })
      .catch((e) => {
        console.error(e);
        return Promise.reject('WorldResolver error: ' + e);
      });
  }


  /** Resolve after loading and parsing the destination map */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const id = route.params['id'];
    if (id) {
      console.log("resolving data for " + id);
    }
    this.loadingService.loading = true;
    this.loadingService.message = 'Traveling to ' + id + '...';
    return new Promise((resolve, reject) => {
      this.world.ready$.take(1).subscribe(() => {
        this._loadMap(id).then((m: GameTileMap) => {
            this.loadingService.loading = false;
            resolve(m);
          })
          .catch(reject);
      });
    });
  }
}


import {Injectable} from '@angular/core';
import {JSONResource} from '../../../game/pow-core/resources/json.resource';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {SpritesRegisterAction} from './sprites.actions';
import {getSpritesLoaded} from '../selectors';
import {SpriteDataMap} from './sprites.model';
import {Observable} from 'rxjs/Observable';
import * as _ from 'underscore';
import {registerSprites} from '../../../game/pow2/core/api';

@Injectable()
export class SpritesService {

  constructor(private resourceLoader: ResourceManager,
              private store: Store<AppState>) {
  }

  /** Preload sprite sheet metadata */
  loadSprites(indexMetaUrl: string): Observable<void> {
    return this.store.select(getSpritesLoaded)
      .take(1)
      .switchMap((loaded: boolean) => {
        if (!loaded) {
          return Observable.fromPromise(this.resourceLoader.load(indexMetaUrl)
            .then((res: JSONResource[]) => {
              const jsonRes = res[0];
              const sources = _.map(jsonRes.data, (baseName: string) => {
                return `${baseName}.json`;
              });
              return Promise.all(_.map(sources, (fileName: string) => {
                return this.resourceLoader.load(fileName)
                  .then((spritesLoaded: JSONResource[]) => {
                    const meta: SpriteDataMap = spritesLoaded[0].data;
                    this.store.dispatch(new SpritesRegisterAction(meta));
                    registerSprites(fileName, meta);
                  });
              }));
            })
            .then(() => Promise.resolve<void>(undefined)));
        }
      });
  }
}

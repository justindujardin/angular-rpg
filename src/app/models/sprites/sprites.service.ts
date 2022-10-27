import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import * as _ from 'underscore';
import { ResourceManager } from '../../../app/core/resource-manager';
import { JSONResource } from '../../../app/core/resources/json.resource';
import { AppState } from '../../app.model';
import { registerSprites } from '../../core/api';
import { getSpritesLoaded } from '../selectors';
import { SpritesRegisterAction } from './sprites.actions';
import { SpriteDataMap } from './sprites.model';

@Injectable()
export class SpritesService {
  constructor(
    private resourceLoader: ResourceManager,
    private store: Store<AppState>
  ) {}

  /** Preload sprite sheet metadata */
  loadSprites(indexMetaUrl: string): Observable<void> {
    return this.store.select(getSpritesLoaded).pipe(
      take(1),
      switchMap((loaded: boolean) => {
        if (!loaded) {
          return from(
            this.resourceLoader
              .load(indexMetaUrl)
              .then((res: JSONResource[]) => {
                const jsonRes = res[0];
                const sources = _.map(jsonRes.data, (baseName: string) => {
                  return `${baseName}.json`;
                });
                return Promise.all(
                  _.map(sources, (fileName: string) => {
                    return this.resourceLoader
                      .load(fileName)
                      .then((spritesLoaded: JSONResource[]) => {
                        const meta: SpriteDataMap = spritesLoaded[0].data;
                        this.store.dispatch(new SpritesRegisterAction(meta));
                        registerSprites(fileName, meta);
                      });
                  })
                );
              })
              .then(() => Promise.resolve<void>(undefined))
          );
        }
      })
    );
  }
}

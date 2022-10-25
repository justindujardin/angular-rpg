import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { from, interval, Observable, ReplaySubject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ResourceManager } from '../../../app/core/resource-manager';
import { TiledTMXResource } from '../../../app/core/resources/tiled/tiled-tmx.resource';
import { AppState } from '../../app.model';
import { getMapUrl } from '../../core/api';

@Injectable()
export class GameStateService {
  constructor(private loader: ResourceManager, private store: Store<AppState>) {}

  private _worldMap$ = new ReplaySubject<TiledTMXResource>(1);
  worldMap$: Observable<TiledTMXResource> = this._worldMap$;

  /**
   * Load a Tiled TMX Map from a url
   */
  loadMap(name: string): Observable<TiledTMXResource> {
    const mapUrl = getMapUrl(name);
    return from(
      this.loader.load(mapUrl).then((maps: TiledTMXResource[]) => {
        this._worldMap$.next(maps[0]);
        return maps[0];
      })
    );
  }

  static STATE_KEY: string = '_angular2PowRPGState';

  resetGame(): Observable<void> {
    return interval(10).pipe(
      first(),
      map(() => {
        localStorage.removeItem(GameStateService.STATE_KEY);
      })
    );
  }

  hasSaveGame(): boolean {
    return !!localStorage.getItem(GameStateService.STATE_KEY);
  }

  load(): Observable<AppState> {
    return interval(10).pipe(
      first(),
      map(() => {
        const data = JSON.parse(
          localStorage.getItem(GameStateService.STATE_KEY)
        ) as AppState;
        return data;
      })
    );
  }

  /**
   * Serialize the application state for later loading
   */
  save(): Observable<AppState> {
    return this.store.pipe(
      first(),
      map((state: AppState) => {
        const most = {
          ...state,
          sprites: {},
        };
        const jsonData: string = JSON.stringify(most);

        localStorage.setItem(GameStateService.STATE_KEY, jsonData);
        return state;
      })
    );
  }
}

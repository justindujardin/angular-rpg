import * as _ from 'underscore';
import {GameDataResource} from './game-data.resource';
import {Injectable} from '@angular/core';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {SPREADSHEET_ID} from './game-data.model';
import {GameDataAddSheetAction} from './game-data.actions';
import {registerSprites} from '../../../game/pow2/core/api';
import {JSONResource} from '../../../game/pow-core/resources/json.resource';

@Injectable()
export class GameDataService {

  constructor(public loader: ResourceManager, public store: Store<AppState>) {
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

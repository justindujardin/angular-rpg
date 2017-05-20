import {GameDataResource} from './game-data.resource';
import {Injectable} from '@angular/core';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {SPREADSHEET_ID} from './game-data.model';
import {GameDataAddSheetAction} from './game-data.actions';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class GameDataService {

  constructor(public loader: ResourceManager, public store: Store<AppState>) {
  }

  /** Load game data from google spreadsheet */
  loadGameData(spreadsheetId: string = SPREADSHEET_ID): Observable<void> {
    return Observable.fromPromise(this.loader.loadAsType(spreadsheetId, GameDataResource).then((resource) => {
      this.store.dispatch(new GameDataAddSheetAction('weapons', resource.data.weapons));
      this.store.dispatch(new GameDataAddSheetAction('armor', resource.data.armor));
      this.store.dispatch(new GameDataAddSheetAction('items', resource.data.items));
      this.store.dispatch(new GameDataAddSheetAction('enemies', resource.data.enemies));
      this.store.dispatch(new GameDataAddSheetAction('magic', resource.data.magic));
      this.store.dispatch(new GameDataAddSheetAction('classes', resource.data.classes));
      this.store.dispatch(new GameDataAddSheetAction('randomEncounters', resource.data.randomencounters));
      this.store.dispatch(new GameDataAddSheetAction('fixedEncounters', resource.data.fixedencounters));
    }));
  }
}

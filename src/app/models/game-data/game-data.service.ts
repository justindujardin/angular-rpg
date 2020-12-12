import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { ResourceManager } from '../../../game/pow-core/resource-manager';
import { AppState } from '../../app.model';
import { GameDataAddSheetAction } from './game-data.actions';
import { SPREADSHEET_ID } from './game-data.model';
import { GameDataResource } from './game-data.resource';

@Injectable()
export class GameDataService {
  constructor(public loader: ResourceManager, public store: Store<AppState>) {}

  /** Load game data from google spreadsheet */
  loadGameData(spreadsheetId: string = SPREADSHEET_ID): Observable<void> {
    return from(
      this.loader.loadAsType(spreadsheetId, GameDataResource).then((resource) => {
        this.store.dispatch(
          new GameDataAddSheetAction('weapons', resource.data.weapons)
        );
        this.store.dispatch(new GameDataAddSheetAction('armor', resource.data.armor));
        this.store.dispatch(new GameDataAddSheetAction('items', resource.data.items));
        this.store.dispatch(
          new GameDataAddSheetAction('enemies', resource.data.enemies)
        );
        this.store.dispatch(new GameDataAddSheetAction('magic', resource.data.magic));
        this.store.dispatch(
          new GameDataAddSheetAction('classes', resource.data.classes)
        );
        this.store.dispatch(
          new GameDataAddSheetAction('randomEncounters', resource.data.randomencounters)
        );
        this.store.dispatch(
          new GameDataAddSheetAction('fixedEncounters', resource.data.fixedencounters)
        );
      })
    );
  }
}

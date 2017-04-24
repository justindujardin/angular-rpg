import {Injectable} from '@angular/core';
import {Actions} from '@ngrx/effects';
import {NotificationService} from '../../components/notification/notification.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {GameDataService} from './game-data.service';

@Injectable()
export class GameDataEffects {

  constructor(private actions$: Actions,
              private notify: NotificationService,
              private store: Store<AppState>,
              private gameDataService: GameDataService) {
  }

}

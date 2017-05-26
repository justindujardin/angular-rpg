import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {RPGGame} from '../../services/index';
import {HeroModel} from '../../../game/rpg/models/all';
import {Observable} from 'rxjs/Observable';
import {Entity} from '../../models/entity/entity.model';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';

@Component({
  selector: 'player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerCardComponent {

  private _model$: Subject<Entity> = new BehaviorSubject<Entity>(null);
  model$: Observable<Entity> = this._model$;

  @Input()
  set model(value: Entity) {
    this._model$.next(value);
  }

  constructor(public game: RPGGame,
              public store: Store<AppState>) {
  }
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppState } from '../../app.model';
import { Entity } from '../../models/entity/entity.model';
import { RPGGame } from '../../services/rpg-game';

@Component({
  selector: 'player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCardComponent {
  private _model$: Subject<Entity> = new BehaviorSubject<Entity>(null);
  model$: Observable<Entity> = this._model$;

  @Input()
  set model(value: Entity) {
    this._model$.next(value);
  }

  constructor(public game: RPGGame, public store: Store<AppState>) {}
}

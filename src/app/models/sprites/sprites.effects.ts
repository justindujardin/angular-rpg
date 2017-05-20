import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Actions, Effect} from '@ngrx/effects';
import {SpritesLoadAction, SpritesLoadFailAction, SpritesLoadSuccessAction} from './sprites.actions';
import {SpritesService} from './sprites.service';

@Injectable()
export class SpritesEffects {

  constructor(private actions$: Actions,
              private spritesService: SpritesService) {
  }

  @Effect() loadSprites$ = this.actions$.ofType(SpritesLoadAction.typeId)
    .switchMap((action: SpritesLoadAction) => {
      return this.spritesService.loadSprites(action.payload).map(() => action.payload);
    })
    .map((url: string) => {
      return new SpritesLoadSuccessAction(url);
    })
    .catch((e) => {
      return Observable.of(new SpritesLoadFailAction(e.toString()));
    });
}

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  SpritesLoadAction,
  SpritesLoadFailAction,
  SpritesLoadSuccessAction,
} from './sprites.actions';
import { SpritesService } from './sprites.service';

@Injectable()
export class SpritesEffects {
  constructor(private actions$: Actions, private spritesService: SpritesService) {}

  @Effect() loadSprites$ = this.actions$.pipe(
    ofType(SpritesLoadAction.typeId),
    switchMap((action: SpritesLoadAction) => {
      return this.spritesService
        .loadSprites(action.payload)
        .pipe(map(() => action.payload));
    }),
    map((url: string) => {
      return new SpritesLoadSuccessAction(url);
    }),
    catchError((e) => {
      return of(new SpritesLoadFailAction(e.toString()));
    })
  );
}

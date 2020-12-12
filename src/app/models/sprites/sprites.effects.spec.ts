import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { SpritesLoadAction, SpritesLoadSuccessAction } from './sprites.actions';
import { SpritesEffects } from './sprites.effects';
import { SpritesService } from './sprites.service';

describe('Sprites', () => {
  const mockSpritesService = {
    loadSprites: () => {
      return of(undefined);
    },
  };

  let actions$ = new Observable<Action>();

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        SpritesEffects,
        { provide: SpritesService, useValue: mockSpritesService },
        provideMockActions(() => actions$),
      ],
    })
  );

  function setup() {
    return {
      service: TestBed.inject(SpritesService),
      effects: TestBed.inject(SpritesEffects),
    };
  }

  describe('Effects', () => {
    describe('loadSprites$', () => {
      it('should load sprites from sprite service when sprites load action is dispatched', (done) => {
        const { effects } = setup();

        actions$ = of(new SpritesLoadAction('fake/path/index.json'));
        effects.loadSprites$.subscribe((result) => {
          expect(result.type).toBe(SpritesLoadSuccessAction.typeId);
          done();
        });
      });
    });
  });
});

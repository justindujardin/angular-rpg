import {EffectsRunner, EffectsTestingModule} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {GameStateEffects} from './game-state.effects';
import {GameState} from './game-state.model';
import {GameStateService} from './game-state.service';
import {
  GameStateLoadSuccessAction,
  GameStateNewAction,
  GameStateTravelAction,
  GameStateTravelSuccessAction
} from './game-state.actions';
import {SpritesEffects} from './sprites.effects';
import {SpritesService} from './sprites.service';
import {SpritesLoadAction, SpritesLoadSuccessAction} from './sprites.actions';
import {Observable} from 'rxjs/Observable';

describe('Sprites', () => {

  const mockSpritesService = {
    loadSprites: () => {
      return Observable.of(undefined);
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [EffectsTestingModule],
    providers: [
      SpritesEffects,
      {provide: SpritesService, useValue: mockSpritesService}
    ]
  }));

  function setup() {
    return {
      service: TestBed.get(SpritesService),
      runner: TestBed.get(EffectsRunner),
      effects: TestBed.get(SpritesEffects)
    };
  }

  describe('Effects', () => {
    describe('loadSprites$', () => {
      it('should load sprites from sprite service when sprites load action is dispatched', (done) => {
        const {runner, effects} = setup();
        runner.queue(new SpritesLoadAction('fake/path/index.json'));
        effects.loadSprites$.subscribe((result) => {
          expect(result.type).toBe(SpritesLoadSuccessAction.typeId);
          done();
        });
      });
    });
  });
});

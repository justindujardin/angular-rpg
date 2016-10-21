import {EffectsTestingModule, EffectsRunner} from '@ngrx/effects/testing';
import {TestBed, inject} from '@angular/core/testing';
import {GameStateEffects} from './game-state.effects';
import {GameState} from './game-state.model';
import {Observable} from 'rxjs';
import {GameStateService} from '../../services/game-state.service';
import {GameStateLoadAction, GameStateActionTypes, GameStateTravelAction} from './game-state.actions';

describe('GameState', () => {

  const mockStateService = {
    loadGame: (from: GameState): Observable<GameState> => {
      return Observable.of(from).debounceTime(1);
    },
    loadMapCalls: 0,
    loadMap: (name: string): Observable<any> => {
      mockStateService.loadMapCalls++;
      return Observable.of({}).debounceTime(1);
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [EffectsTestingModule],
    providers: [
      GameStateEffects,
      {provide: GameStateService, useValue: mockStateService}
    ]
  }));

  let runner: EffectsRunner;
  let effects: GameStateEffects;
  let gameStateService: GameStateService;
  beforeEach(inject(
    [EffectsRunner, GameStateEffects, GameStateService],
    (_runner, _effects, _state) => {
      runner = _runner;
      effects = _effects;
      gameStateService = _state;
      mockStateService.loadMapCalls = 0;
    }));

  describe('Effects', () => {
    describe('initLoadedGame$', () => {
      const fakeGameState: any = {};
      it('should dispatch load success after game state service loads the game', () => {
        runner.queue(new GameStateLoadAction(fakeGameState));
        effects.initLoadedGame$.subscribe(result => {
          expect(result.type).toBe(GameStateActionTypes.LOAD_SUCCESS);
        });
      });
    });
    describe('afterLoadTravelToCurrentLocation$', () => {
      const fakeGameState: any = {
        map: 'map',
        position: {x: 0, y: 0}
      };
      it('should dispatch a travel action to the current location after game load success', () => {
        runner.queue(new GameStateLoadAction(fakeGameState));
        effects.afterLoadTravelToCurrentLocation$.subscribe(result => {
          expect(result.type).toBe(GameStateActionTypes.TRAVEL);
        });
      });
    });
    describe('travel$', () => {
      it('should dispatch a travel success action after loading the map', () => {
        expect(mockStateService.loadMapCalls).toBe(0);
        runner.queue(new GameStateTravelAction('map', {x: 0, y: 0}));
        effects.travel$.subscribe(result => {
          expect(mockStateService.loadMapCalls).toBe(1);
          expect(result.type).toBe(GameStateActionTypes.TRAVEL_SUCCESS);
        });
      });

    });
  });
});

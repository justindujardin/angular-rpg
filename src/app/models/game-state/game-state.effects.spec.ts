import {EffectsRunner, EffectsTestingModule} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {GameStateEffects} from './game-state.effects';
import {GameState} from './game-state.model';
import {Observable} from 'rxjs';
import {GameStateService} from './game-state.service';
import {
  GameStateLoadAction,
  GameStateLoadSuccessAction,
  GameStateTravelAction,
  GameStateTravelSuccessAction
} from './game-state.actions';
import {NotificationService} from '../../components/notification/notification.service';

describe('GameState', () => {

  const mockStateService = {
    load: (from: GameState): Observable<GameState> => {
      return Observable.of(from);
    },
    loadMapCalls: 0,
    loadMap: (name: string): Observable<any> => {
      mockStateService.loadMapCalls++;
      return Observable.of({});
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [EffectsTestingModule],
    providers: [
      GameStateEffects,
      {
        provide: NotificationService,
        useValue: jasmine.createSpyObj('notify', ['show'])
      },
      {
        provide: GameStateService,
        useValue: mockStateService
      }
    ]
  }));

  function setup() {
    return {
      service: TestBed.get(GameStateService),
      runner: TestBed.get(EffectsRunner),
      effects: TestBed.get(GameStateEffects)
    };
  }

  describe('Effects', () => {
    describe('initLoadedGame$', () => {
      it('should dispatch load success after game state service loads the game', (done) => {
        const {runner, effects} = setup();
        runner.queue(new GameStateLoadAction());
        effects.initLoadedGame$.subscribe((result) => {
          expect(result.type).toBe(GameStateLoadSuccessAction.typeId);
          done();
        });
      });
    });
    describe('afterLoadTravelToCurrentLocation$', () => {
      const fakeAppState: any = {
        gameState: {
          map: 'map',
          position: {x: 0, y: 0}
        }
      };
      it('should dispatch a travel action to the current location after game load success', (done) => {
        const {runner, effects} = setup();
        runner.queue(new GameStateLoadSuccessAction(fakeAppState));
        effects.afterLoadTravelToCurrentLocation$.subscribe((result) => {
          expect(result.type).toBe(GameStateTravelAction.typeId);
          done();
        });
      });
    });
    describe('travel$', () => {
      it('should dispatch a travel success action after loading the map', (done) => {
        const {runner, effects} = setup();
        expect(mockStateService.loadMapCalls).toBe(0);
        runner.queue(new GameStateTravelAction({
          location: 'map',
          position: {x: 0, y: 0}
        }));
        effects.travel$.subscribe((result) => {
          expect(mockStateService.loadMapCalls).toBe(1);
          expect(result.type).toBe(GameStateTravelSuccessAction.typeId);
          done();
        });
      });
    });
  });
});

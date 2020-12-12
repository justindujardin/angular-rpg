import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { NotificationService } from '../../components/notification/notification.service';
import {
  GameStateLoadAction,
  GameStateLoadSuccessAction,
  GameStateTravelAction,
  GameStateTravelSuccessAction,
} from './game-state.actions';
import { GameStateEffects } from './game-state.effects';
import { GameState } from './game-state.model';
import { GameStateService } from './game-state.service';

let actions$ = new Observable<Action>();

describe('GameState', () => {
  const mockStateService = {
    load: (from: GameState): Observable<GameState> => {
      return of(from);
    },
    loadMapCalls: 0,
    loadMap: (name: string): Observable<any> => {
      mockStateService.loadMapCalls++;
      return of({});
    },
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GameStateEffects,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notify', ['show']),
        },
        {
          provide: GameStateService,
          useValue: mockStateService,
        },
        provideMockActions(() => actions$),
      ],
    })
  );

  function setup() {
    return {
      service: TestBed.inject(GameStateService),
      effects: TestBed.inject(GameStateEffects),
    };
  }

  describe('Effects', () => {
    describe('initLoadedGame$', () => {
      it('should dispatch load success after game state service loads the game', (done) => {
        const { effects } = setup();
        actions$ = of(new GameStateLoadAction());
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
          position: { x: 0, y: 0 },
        },
      };
      it('should dispatch a travel action to the current location after game load success', (done) => {
        const { effects } = setup();
        actions$ = of(new GameStateLoadSuccessAction(fakeAppState));
        effects.afterLoadTravelToCurrentLocation$.subscribe((result) => {
          expect(result.type).toBe(GameStateTravelAction.typeId);
          done();
        });
      });
    });
    describe('travel$', () => {
      it('should dispatch a travel success action after loading the map', (done) => {
        const { effects } = setup();
        expect(mockStateService.loadMapCalls).toBe(0);
        actions$ = of(
          new GameStateTravelAction({
            location: 'map',
            position: { x: 0, y: 0 },
          })
        );
        effects.travel$.subscribe((result) => {
          expect(mockStateService.loadMapCalls).toBe(1);
          expect(result.type).toBe(GameStateTravelSuccessAction.typeId);
          done();
        });
      });
    });
  });
});

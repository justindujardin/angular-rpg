import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { Point } from '../../../core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { GameStateNewAction } from '../../../models/game-state/game-state.actions';
import { GameState } from '../../../models/game-state/game-state.model';
import { getGameMap, getGamePartyPosition } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { GameWorld } from '../../../services/game-world';
import {
  IPortalFeatureProperties,
  PortalFeatureComponent,
} from './portal-feature.component';

function getPartyLocationInfo(store: Store<AppState>): IPortalFeatureProperties {
  let result: IPortalFeatureProperties | undefined = undefined;
  combineLatest([store.select(getGamePartyPosition), store.select(getGameMap)])
    .pipe(
      first(),
      map((args: [Point, string]): IPortalFeatureProperties => {
        const position = args[0];
        const target = args[1];
        return { target, targetX: position.x, targetY: position.y };
      })
    )
    .subscribe((r) => (result = r));
  assertTrue(result, 'invalid party data');
  return result as IPortalFeatureProperties;
}

function getFeature(
  values: Partial<ITiledObject<IPortalFeatureProperties>> = {},
  properties: Partial<IPortalFeatureProperties> = {}
): ITiledObject<IPortalFeatureProperties> {
  return {
    name: 'feature',
    class: 'PortalFeatureComponent',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    visible: true,
    properties: {
      target: 'example',
      targetX: 10,
      targetY: 10,
      ...properties,
    },
    ...values,
  };
}

fdescribe('PortalFeatureComponent', () => {
  let world: GameWorld;
  const tileObject: any = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [PortalFeatureComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const initialState: GameState = {
      party: Immutable.List<string>([]),
      inventory: Immutable.List<string>(),
      battleCounter: 0,
      keyData: Immutable.Map<string, any>(),
      gold: 100,
      combatZone: '',
      location: '',
      position: { x: 12, y: 8 },
      boardedShip: false,
      shipPosition: { x: 7, y: 23 },
    };
    world.store.dispatch(new GameStateNewAction(initialState));
  });

  it('should change party location to target at x/y', async () => {
    const fixture = TestBed.createComponent(PortalFeatureComponent);
    const comp: PortalFeatureComponent = fixture.componentInstance;

    let info: IPortalFeatureProperties = getPartyLocationInfo(world.store);
    expect(info.target).toBe('');
    expect(info.targetX).toBe(12);
    expect(info.targetY).toBe(8);

    comp.feature = getFeature();
    fixture.detectChanges();

    comp.entered(tileObject);
    fixture.detectChanges();

    info = getPartyLocationInfo(world.store);
    expect(info.target).toBe('example');
    expect(info.targetX).toBe(10);
    expect(info.targetY).toBe(10);
  });
  it('location stays the same if not target is specified', async () => {
    const fixture = TestBed.createComponent(PortalFeatureComponent);
    const comp: PortalFeatureComponent = fixture.componentInstance;

    let info: IPortalFeatureProperties = getPartyLocationInfo(world.store);
    expect(info.target).toBe('');
    expect(info.targetX).toBe(12);
    expect(info.targetY).toBe(8);

    comp.feature = getFeature({}, { target: undefined });
    fixture.detectChanges();

    comp.entered(tileObject);
    fixture.detectChanges();

    info = getPartyLocationInfo(world.store);
    expect(info.target).toBe('');
    expect(info.targetX).toBe(12);
    expect(info.targetY).toBe(8);
  });
});

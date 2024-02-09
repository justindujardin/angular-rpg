import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { Point } from '../../../core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { getGameMap, getGamePartyPosition } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
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
      }),
    )
    .subscribe((r) => (result = r));
  assertTrue(result, 'invalid party data');
  return result as IPortalFeatureProperties;
}

function getFeature(
  values: Partial<ITiledObject<IPortalFeatureProperties>> = {},
  properties: Partial<IPortalFeatureProperties> = {},
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

describe('PortalFeatureComponent', () => {
  let world: GameWorld;
  const tileObject: any = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [PortalFeatureComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('should change party location to target at x/y', async () => {
    const fixture = TestBed.createComponent(PortalFeatureComponent);
    const comp: PortalFeatureComponent = fixture.componentInstance;

    let info: IPortalFeatureProperties = getPartyLocationInfo(world.store);
    expect(info.target).toBe('town');
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
  it('location stays the same if no target is specified', async () => {
    const fixture = TestBed.createComponent(PortalFeatureComponent);
    const comp: PortalFeatureComponent = fixture.componentInstance;

    let info: IPortalFeatureProperties = getPartyLocationInfo(world.store);
    expect(info.target).toBe('town');
    expect(info.targetX).toBe(12);
    expect(info.targetY).toBe(8);

    comp.feature = getFeature({}, { target: undefined });
    fixture.detectChanges();

    comp.entered(tileObject);
    fixture.detectChanges();

    info = getPartyLocationInfo(world.store);
    expect(info.target).toBe('town');
    expect(info.targetX).toBe(12);
    expect(info.targetY).toBe(8);
  });
});

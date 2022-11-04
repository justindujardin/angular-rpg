import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import {
  GameStateNewAction,
  GameStateSetKeyDataAction,
} from '../../../models/game-state/game-state.actions';
import { GameState } from '../../../models/game-state/game-state.model';
import { getGameKey } from '../../../models/selectors';
import { GameWorld } from '../../../services/game-world';
import { DoorFeatureComponent, IDoorFeatureProperties } from './door-feature.component';

function getKeyData(store: Store<AppState>, keyName?: string): boolean | undefined {
  let result: boolean | undefined = undefined;
  store
    .select(getGameKey(keyName || ''))
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

function getFeature(
  values: Partial<ITiledObject<IDoorFeatureProperties>> = {},
  properties: Partial<IDoorFeatureProperties> = {}
): ITiledObject<IDoorFeatureProperties> {
  return {
    name: 'feature',
    class: 'DoorFeatureComponent',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    visible: true,
    properties: {
      id: 'test-door',
      requiredKey: 'test-key',
      icon: '',
      title: 'a door',
      lockedText: 'locked',
      unlockText: 'you unlocked the door',
      ...properties,
    },
    ...values,
  };
}

describe('DoorFeatureComponent', () => {
  let world: GameWorld;
  const tileObject: any = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [DoorFeatureComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const initialState: GameState = {
      party: Immutable.List<string>([]),
      inventory: Immutable.List<string>(),
      battleCounter: 0,
      keyData: Immutable.Map<string, any>(),
      gold: 100,
      combatZone: '',
      location: 'example',
      position: { x: 12, y: 8 },
      boardedShip: false,
      shipPosition: { x: 7, y: 23 },
    };
    world.store.dispatch(new GameStateNewAction(initialState));
  });

  it('should display lockedText when party lacks the requiredKey', async () => {
    const fixture = TestBed.createComponent(DoorFeatureComponent);
    const comp: DoorFeatureComponent = fixture.componentInstance;

    comp.feature = getFeature();
    fixture.detectChanges();

    comp.enter(tileObject);
    fixture.detectChanges();

    const doorText = fixture.debugElement.query(By.css('.text'));
    expect(doorText.nativeElement.innerText).toBe(comp.feature.properties?.lockedText);
  });

  it('should display unlockText when no requiredKey is specified', async () => {
    const fixture = TestBed.createComponent(DoorFeatureComponent);
    const comp: DoorFeatureComponent = fixture.componentInstance;

    comp.feature = getFeature({}, { requiredKey: undefined });
    fixture.detectChanges();

    comp.enter(tileObject);
    fixture.detectChanges();

    const doorText = fixture.debugElement.query(By.css('.text'));
    expect(doorText.nativeElement.innerText).toBe(comp.feature.properties?.unlockText);
  });

  it('should unlock when party has requiredKey', async () => {
    const fixture = TestBed.createComponent(DoorFeatureComponent);
    const comp: DoorFeatureComponent = fixture.componentInstance;

    comp.feature = getFeature();
    fixture.detectChanges();

    // Acquire the key
    world.store.dispatch(
      new GameStateSetKeyDataAction(comp.feature.properties?.requiredKey || '', true)
    );

    comp.enter(tileObject);
    fixture.detectChanges();
    const doorText = fixture.debugElement.query(By.css('.text'));
    expect(doorText.nativeElement.innerText).toBe(comp.feature.properties?.unlockText);

    comp.exit(tileObject);
    fixture.detectChanges();
    expect(getKeyData(world.store, comp.feature.properties?.id)).toBe(true);
  });

  it('should output onClose when clicking the x button', async () => {
    const fixture = TestBed.createComponent(DoorFeatureComponent);
    const comp: DoorFeatureComponent = fixture.componentInstance;
    comp.feature = getFeature();
    fixture.detectChanges();
    comp.enter(tileObject);
    fixture.detectChanges();

    expect(comp.active).toBe(true);

    let clicked = false;
    comp.onClose.pipe(take(1)).subscribe(() => (clicked = true));

    const doClose = fixture.debugElement.query(By.css('.btn-close'));
    doClose.triggerEventHandler('click');

    expect(clicked).toBe(true);
  });
});

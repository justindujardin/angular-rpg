import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { GameStateNewAction } from '../../../models/game-state/game-state.actions';
import { GameState } from '../../../models/game-state/game-state.model';
import { getGameKey } from '../../../models/selectors';
import { GameWorld } from '../../../services/game-world';
import {
  DialogFeatureComponent,
  IDialogFeatureProperties,
} from './dialog-feature.component';

function getKeyData(store: Store<AppState>, keyName: string): boolean | undefined {
  let result: boolean | undefined = undefined;
  store
    .select(getGameKey(keyName))
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

function getFeature(
  values: Partial<ITiledObject<IDialogFeatureProperties>> = {},
  properties: Partial<IDialogFeatureProperties> = {}
): ITiledObject<IDialogFeatureProperties> {
  return {
    name: 'feature',
    class: 'DialogFeatureComponent',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    visible: true,
    properties: {
      icon: '',
      text: 'dialog text',
      title: 'dialog title',
      ...properties,
    },
    ...values,
  };
}

describe('DialogFeatureComponent', () => {
  let world: GameWorld;
  const tileObject: any = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [DialogFeatureComponent],
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

  it('should optionally set game key data when dialog is exited', async () => {
    const fixture = TestBed.createComponent(DialogFeatureComponent);
    const comp: DialogFeatureComponent = fixture.componentInstance;
    const keyName = 'my-key-data';
    comp.feature = getFeature({}, { sets: 'my-key-data' });
    expect(getKeyData(world.store, keyName)).toBeUndefined();
    fixture.detectChanges();
    comp.enter(tileObject);
    fixture.detectChanges();
    comp.exit(tileObject);
    fixture.detectChanges();
    expect(getKeyData(world.store, keyName)).toBe(true);
  });

  it('should output onClose when clicking the x button', async () => {
    const fixture = TestBed.createComponent(DialogFeatureComponent);
    const comp: DialogFeatureComponent = fixture.componentInstance;
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

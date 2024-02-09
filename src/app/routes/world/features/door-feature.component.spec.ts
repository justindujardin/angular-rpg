import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { testAppGetKeyData } from '../../../app.testing';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { GameStateSetKeyDataAction } from '../../../models/game-state/game-state.actions';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { DoorFeatureComponent, IDoorFeatureProperties } from './door-feature.component';

function getFeature(
  values: Partial<ITiledObject<IDoorFeatureProperties>> = {},
  properties: Partial<IDoorFeatureProperties> = {},
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
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
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
      new GameStateSetKeyDataAction(comp.feature.properties?.requiredKey || '', true),
    );

    comp.enter(tileObject);
    fixture.detectChanges();
    const doorText = fixture.debugElement.query(By.css('.text'));
    expect(doorText.nativeElement.innerText).toBe(comp.feature.properties?.unlockText);

    comp.exit(tileObject);
    fixture.detectChanges();
    expect(testAppGetKeyData(world.store, comp.feature.properties?.id)).toBe(true);
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

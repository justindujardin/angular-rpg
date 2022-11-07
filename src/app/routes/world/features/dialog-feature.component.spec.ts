import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { testAppGetKeyData } from '../../../app.testing';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import {
  DialogFeatureComponent,
  IDialogFeatureProperties,
} from './dialog-feature.component';

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
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('should optionally set game key data when dialog is exited', async () => {
    const fixture = TestBed.createComponent(DialogFeatureComponent);
    const comp: DialogFeatureComponent = fixture.componentInstance;
    const keyName = 'my-key-data';
    comp.feature = getFeature({}, { sets: 'my-key-data' });
    expect(testAppGetKeyData(world.store, keyName)).toBeUndefined();
    fixture.detectChanges();
    comp.enter(tileObject);
    fixture.detectChanges();
    comp.exit(tileObject);
    fixture.detectChanges();
    expect(testAppGetKeyData(world.store, keyName)).toBe(true);
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

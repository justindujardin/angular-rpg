import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { testAppGetInventory, testAppGetPartyGold } from '../../../app.testing';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { assertTrue } from '../../../models/util';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import {
  ITreasureFeatureProperties,
  TreasureFeatureComponent,
} from './treasure-feature.component';

function getFeature(
  values: Partial<ITiledObject<ITreasureFeatureProperties>> = {},
  properties: Partial<ITreasureFeatureProperties> = {},
): ITiledObject<ITreasureFeatureProperties> {
  return {
    name: 'feature',
    class: 'TempleFeatureComponent',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    visible: true,
    properties: {
      id: 'test-treasure',
      ...properties,
    },
    ...values,
  };
}

describe('TreasureFeatureComponent', () => {
  let world: GameWorld;
  const tileObject: any = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [TreasureFeatureComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('should show a sad message when no treasure types are specified', async () => {
    const fixture = TestBed.createComponent(TreasureFeatureComponent);
    const comp: TreasureFeatureComponent = fixture.componentInstance;

    comp.feature = getFeature();
    fixture.detectChanges();

    comp.enter(tileObject);
    fixture.detectChanges();

    const notification = comp.notify.getFirst();
    assertTrue(notification, 'no notification shown');
    expect(notification.message).toBe("It's empty.");
  });

  it('should instantiate and award item when specified', async () => {
    const fixture = TestBed.createComponent(TreasureFeatureComponent);
    const comp: TreasureFeatureComponent = fixture.componentInstance;

    const beforeInv = testAppGetInventory(world.store);

    comp.feature = getFeature({}, { item: 'club' });
    fixture.detectChanges();

    comp.enter(tileObject);
    fixture.detectChanges();

    // Added item to party inventory
    const afterInv = testAppGetInventory(world.store);
    expect(afterInv.length).toBe(beforeInv.length + 1);
    expect(afterInv.find((i) => i.id === 'club')).toBeDefined();

    const notification = comp.notify.getFirst();
    assertTrue(notification, 'no notification shown');
    expect(notification.message).toBe('You found Club!');
  });

  it('should show a message when specified', async () => {
    const fixture = TestBed.createComponent(TreasureFeatureComponent);
    const comp: TreasureFeatureComponent = fixture.componentInstance;

    comp.feature = getFeature({}, { text: 'custom' });
    fixture.detectChanges();

    comp.enter(tileObject);
    fixture.detectChanges();

    const notification = comp.notify.getFirst();
    assertTrue(notification, 'no notification shown');
    expect(notification.message).toBe('You found custom!');
  });

  it('should award gold when specified', async () => {
    const fixture = TestBed.createComponent(TreasureFeatureComponent);
    const comp: TreasureFeatureComponent = fixture.componentInstance;

    const beforeGold = testAppGetPartyGold(world.store);

    comp.feature = getFeature({}, { gold: 25 });
    fixture.detectChanges();

    comp.enter(tileObject);
    fixture.detectChanges();

    const afterGold = testAppGetPartyGold(world.store);
    expect(afterGold).toBe(beforeGold + 25);

    const notification = comp.notify.getFirst();
    assertTrue(notification, 'no notification shown');
    expect(notification.message).toBe('You found 25 gold!');
  });
});

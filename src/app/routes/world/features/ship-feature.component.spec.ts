import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import {
  GameStateBoardShipAction,
  GameStateNewAction,
} from '../../../models/game-state/game-state.actions';
import { GameState } from '../../../models/game-state/game-state.model';
import { getGameBoardedShip } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { Scene } from '../../../scene/scene';
import { GameWorld } from '../../../services/game-world';
import { PlayerBehaviorComponent } from '../behaviors/player-behavior';
import { IShipFeatureProperties, ShipFeatureComponent } from './ship-feature.component';

function getFeature(
  values: Partial<ITiledObject<IShipFeatureProperties>> = {},
  properties: Partial<IShipFeatureProperties> = {}
): ITiledObject<IShipFeatureProperties> {
  return {
    name: 'feature',
    class: 'ShipFeatureComponent',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    visible: true,
    properties: {
      ...properties,
    },
    ...values,
  };
}

function getBoarded(store: Store<AppState>): boolean {
  let result: boolean = false;
  store
    .select(getGameBoardedShip)
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

function getScene(comp: ShipFeatureComponent): {
  scene: Scene;
  object: GameFeatureObject;
} {
  const scene = new Scene();
  const object = new GameFeatureObject();
  object.addBehavior(
    TestBed.createComponent(PlayerBehaviorComponent).componentInstance
  );
  scene.addObject(object);
  scene.addObject(comp);
  return { scene, object };
}

describe('ShipFeatureComponent', () => {
  let world: GameWorld;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [ShipFeatureComponent],
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
  describe('enter', () => {
    it('fails without PlayerBehaviorComponent', async () => {
      const fixture = TestBed.createComponent(ShipFeatureComponent);
      const comp: ShipFeatureComponent = fixture.componentInstance;

      comp.feature = getFeature();
      fixture.detectChanges();

      const tileObject = new GameFeatureObject();
      expect(comp.enter(tileObject)).toBe(false);
    });
    it('succeeds with PlayerBehaviorComponent', async () => {
      const fixture = TestBed.createComponent(ShipFeatureComponent);
      const comp: ShipFeatureComponent = fixture.componentInstance;

      // Add a party
      const tileObject = new GameFeatureObject();
      tileObject.addBehavior(
        TestBed.createComponent(PlayerBehaviorComponent).componentInstance
      );

      comp.feature = getFeature();
      fixture.detectChanges();

      expect(comp.enter(tileObject)).toBe(true);
    });
  });

  it('boards when entered', async () => {
    const fixture = TestBed.createComponent(ShipFeatureComponent);
    const comp: ShipFeatureComponent = fixture.componentInstance;

    // Add a party
    const { scene, object } = getScene(comp);
    comp.feature = getFeature();
    fixture.detectChanges();

    expect(getBoarded(world.store)).toBe(false);
    expect(comp.enter(object)).toBe(true);
    expect(comp.entered(object)).toBe(true);
    expect(getBoarded(world.store)).toBe(true);
  });

  it('boards when initialized while already on a ship', async () => {
    const fixture = TestBed.createComponent(ShipFeatureComponent);
    const comp: ShipFeatureComponent = fixture.componentInstance;

    // Add a party
    getScene(comp);
    world.store.dispatch(new GameStateBoardShipAction(true));
    comp.feature = getFeature();

    fixture.detectChanges();
    await fixture.whenStable();
    expect(comp.boarded).toBe(true);
  });
  it('should disembark when target position is a regular passable tile', async () => {
    const fixture = TestBed.createComponent(ShipFeatureComponent);
    const comp: ShipFeatureComponent = fixture.componentInstance;
    getScene(comp);
    world.store.dispatch(new GameStateBoardShipAction(true));
    fixture.detectChanges();
    // Add a party
    comp.feature = getFeature();
    fixture.detectChanges();
    expect(comp.boarded).toBe(true);

    assertTrue(comp.party, 'invalid party object');
    comp.party.velocity.set(1, 0);
    // Because there is no valid tilemaps both collision checks will return
    // false, and any tick with cause a disembark. If the collision component
    // changes this test may need updating.
    comp.scene.tick(100);

    // We've disembarked
    expect(comp.boarded).toBe(false);
    expect(getBoarded(world.store)).toBe(false);
  });
});

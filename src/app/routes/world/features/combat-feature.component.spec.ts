import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { Point, Rect } from '../../../core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { IZoneMatch } from '../../../models/combat/combat.model';
import { getCombatType } from '../../../models/selectors';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { Scene } from '../../../scene/scene';
import { TileMap } from '../../../scene/tile-map';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { PlayerBehaviorComponent } from '../behaviors/player-behavior';
import {
  CombatFeatureComponent,
  ICombatFeatureProperties,
} from './combat-feature.component';

class CombatFeatureTestMap extends TileMap {
  getCombatZones(at: Point): IZoneMatch {
    return {
      map: 'test-map',
      targets: [{ bounds: new Rect(0, 0, 10, 10), water: false, zone: 'world-plains' }],
      targetPoint: at,
    };
  }
}

function getFeature(
  values: Partial<ITiledObject<ICombatFeatureProperties>> = {},
  properties: Partial<ICombatFeatureProperties> = {},
): ITiledObject<ICombatFeatureProperties> {
  return {
    name: 'feature',
    class: 'CombatFeatureComponent',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    visible: true,
    properties: {
      id: 'world-plains-snakes',
      ...properties,
    },
    ...values,
  };
}

function getEncounterType(store: Store<AppState>): string {
  let result: string = '';
  store
    .select(getCombatType)
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

function getScene(
  comp: CombatFeatureComponent,
  map: TileMap | null = null,
  addPlayer: boolean = true,
): {
  scene: Scene;
  object: GameFeatureObject;
  player: PlayerBehaviorComponent;
} {
  const scene = new Scene();
  const object = new GameFeatureObject();
  if (map === null) {
    map = new CombatFeatureTestMap();
  }
  let player: PlayerBehaviorComponent | null = null;
  if (addPlayer) {
    player = TestBed.createComponent(PlayerBehaviorComponent).componentInstance;
    player.map = map;
    object.addBehavior(player);
  }
  object.tileMap = map;
  scene.addObject(map);
  scene.addObject(object);
  scene.addObject(comp);
  return { scene, object, player: player as PlayerBehaviorComponent };
}

describe('CombatFeatureComponent', () => {
  let world: GameWorld;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [...APP_IMPORTS],
      declarations: [CombatFeatureComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('triggers a fixed-encounter when entered', async () => {
    const fixture = TestBed.createComponent(CombatFeatureComponent);
    const comp: CombatFeatureComponent = fixture.componentInstance;

    // Add a party
    const { player, object } = getScene(comp);
    comp.feature = getFeature();
    fixture.detectChanges();
    player.velocity.set(1, 1);

    // No encounter at first
    expect(getEncounterType(world.store)).toBe('none');
    // Enter the feature and trigger combat
    expect(comp.enter(object)).toBe(true);
    // Velocity is set to zero when combat is triggered
    expect(player.velocity.isZero()).toBe(true);
    // Combat type is "fixed"
    expect(getEncounterType(world.store)).toBe('fixed');
  });
  it('fails when no feature.id is specified', () => {
    const fixture = TestBed.createComponent(CombatFeatureComponent);
    const comp: CombatFeatureComponent = fixture.componentInstance;
    const { object } = getScene(comp);
    comp.feature = getFeature({}, { id: undefined });
    fixture.detectChanges();
    expect(comp.enter(object)).toBe(false);
  });
  it('fails when no combat zone is found', () => {
    const fixture = TestBed.createComponent(CombatFeatureComponent);
    const comp: CombatFeatureComponent = fixture.componentInstance;
    const { object } = getScene(comp, new TileMap());
    comp.feature = getFeature();
    fixture.detectChanges();
    expect(comp.enter(object)).toBe(false);
  });
  it('fails when no player behavior is found', () => {
    const fixture = TestBed.createComponent(CombatFeatureComponent);
    const comp: CombatFeatureComponent = fixture.componentInstance;
    const { object } = getScene(comp, null, false);
    comp.feature = getFeature();
    fixture.detectChanges();
    expect(comp.enter(object)).toBe(false);
  });
});

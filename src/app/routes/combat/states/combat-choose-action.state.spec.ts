import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { testAppAddToInventory } from '../../../app.testing';
import { Point, Rect } from '../../../core';
import { ITEMS_DATA } from '../../../models/game-data/items';
import { MAGIC_DATA } from '../../../models/game-data/magic';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { SceneView } from '../../../scene/scene-view';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import {
  CombatAttackBehaviorComponent,
  CombatItemBehavior,
  CombatMagicBehavior,
} from '../behaviors/actions';
import { CombatEnemyComponent } from '../combat-enemy.component';
import { testCombatCreateComponent } from '../combat.testing';
import {
  chooseMove,
  CombatChooseActionStateComponent,
} from './combat-choose-action.state';

function getPointerPosition(comp: CombatChooseActionStateComponent): Point {
  let point = new Point();
  comp.pointerPosition$.pipe(take(1)).subscribe((p) => {
    point.set(p);
  });
  tick(51);
  return point;
}

describe('CombatChooseActionStateComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatChooseActionStateComponent],
    }).compileComponents();
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
    world = TestBed.inject(GameWorld);
    world.time.start();
  });
  afterEach(() => {
    world.time.stop();
  });

  describe('chooseMove', async () => {
    it('casts heal on injured party members', async () => {
      testAppAddToInventory(world.store, 'heal', MAGIC_DATA);
      const combat = testCombatCreateComponent(null);
      const party = combat.party.toArray();
      const player = party.find((p) => p.model.type === 'healer');
      assertTrue(player, 'could not find healer to cast heal');
      player.model = { ...player.model, hp: 10 };
      const enemies = combat.enemies.toArray();
      const action = chooseMove(
        player,
        enemies,
        party,
        combat.machine.spells.toJS(),
        combat.machine.items.toJS(),
      );
      expect(action instanceof CombatMagicBehavior).toBe(true);
      expect(action.spell?.id).toBe('heal');
    });
    it('casts push on enemies if available', async () => {
      testAppAddToInventory(world.store, 'push', MAGIC_DATA);
      const combat = testCombatCreateComponent(null);
      const party = combat.party.toArray();
      const player = party.find((p) => p.model.type === 'healer');
      assertTrue(player, 'could not find healer to cast heal');
      const enemies = combat.enemies.toArray();
      const action = chooseMove(
        player,
        enemies,
        party,
        combat.machine.spells.toJS(),
        combat.machine.items.toJS(),
      );
      expect(action instanceof CombatMagicBehavior).toBe(true);
      expect(action.spell?.id).toBe('push');
    });
    it('uses potion on injured party members', async () => {
      testAppAddToInventory(world.store, 'potion', ITEMS_DATA);
      const combat = testCombatCreateComponent(null);
      const party = combat.party.toArray();
      const player = party.find((p) => p.model.type === 'warrior');
      assertTrue(player, 'could not find player');
      player.model = { ...player.model, hp: 10 };
      const enemies = combat.enemies.toArray();
      const action = chooseMove(
        player,
        enemies,
        party,
        combat.machine.spells.toJS(),
        combat.machine.items.toJS(),
      );
      expect(action instanceof CombatItemBehavior).toBe(true);
      expect(action.item?.id).toBe('potion');
    });
    it('attacks enemies as a last resort', async () => {
      const combat = testCombatCreateComponent(null);
      const party = combat.party.toArray();
      const player = party.find((p) => p.model.type === 'warrior');
      assertTrue(player, 'could not find player');
      const enemies = combat.enemies.toArray();
      const action = chooseMove(
        player,
        enemies,
        party,
        combat.machine.spells.toJS(),
        combat.machine.items.toJS(),
      );
      expect(action instanceof CombatAttackBehaviorComponent).toBe(true);
      expect(action.to instanceof CombatEnemyComponent).toBe(true);
    });
  });

  describe('pointerPosition$', () => {
    it('returns (0,0) with no view', fakeAsync(() => {
      const fixture = TestBed.createComponent(CombatChooseActionStateComponent);
      const comp = fixture.componentInstance;
      comp.pointAt = new GameEntityObject();
      const point = getPointerPosition(comp);
      expect(point.isZero()).toBe(true);
      discardPeriodicTasks();
    }));
    it('returns (0,0) with no pointAt', fakeAsync(() => {
      const fixture = TestBed.createComponent(CombatChooseActionStateComponent);
      const comp = fixture.componentInstance;
      comp.view = new SceneView();
      const point = getPointerPosition(comp);
      expect(point.isZero()).toBe(true);
      discardPeriodicTasks();
    }));
    it('calculate screen coordinates from pointAt aligned left', fakeAsync(() => {
      const fixture = TestBed.createComponent(CombatChooseActionStateComponent);
      const comp = fixture.componentInstance;
      comp.view = new SceneView();
      comp.view.camera = new Rect(0, 0, 10, 10);
      comp.pointAt = new GameEntityObject();
      comp.pointAt.point.set(5, 5);
      const point = getPointerPosition(comp);

      // Calculate world point with pointer offset
      const expectedPoint = comp.pointAt.point
        .clone()
        .add(CombatChooseActionStateComponent.LEFT_OFFSET);
      // Converting to screen space
      const screenPoint = comp.view.worldToScreen(expectedPoint);
      expect(point.x).toBe(screenPoint.x);
      expect(point.y).toBe(screenPoint.y);

      discardPeriodicTasks();
    }));
    it('calculate screen coordinates from pointAt aligned right', fakeAsync(() => {
      const fixture = TestBed.createComponent(CombatChooseActionStateComponent);
      const comp = fixture.componentInstance;
      comp.view = new SceneView();
      comp.view.camera = new Rect(0, 0, 10, 10);
      comp.pointAt = new GameEntityObject();
      comp.pointAt.point.set(5, 5);
      comp.pointAtDir = 'right';
      const point = getPointerPosition(comp);

      // Calculate world point with pointer offset
      const expectedPoint = comp.pointAt.point
        .clone()
        .add(CombatChooseActionStateComponent.RIGHT_OFFSET);
      // Converting to screen space
      const screenPoint = comp.view.worldToScreen(expectedPoint);
      expect(point.x).toBe(screenPoint.x);
      expect(point.y).toBe(screenPoint.y);
      discardPeriodicTasks();
    }));
  });
});

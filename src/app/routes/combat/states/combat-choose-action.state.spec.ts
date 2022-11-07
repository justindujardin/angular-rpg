import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { Point, Rect } from '../../../core';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { SceneView } from '../../../scene/scene-view';
import { CombatChooseActionStateComponent } from './combat-choose-action.state';

function getPointerPosition(comp: CombatChooseActionStateComponent): Point {
  let point = new Point();
  comp.pointerPosition$.pipe(take(1)).subscribe((p) => {
    point.set(p);
  });
  tick(51);
  return point;
}

describe('CombatChooseActionStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatChooseActionStateComponent],
    }).compileComponents();
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

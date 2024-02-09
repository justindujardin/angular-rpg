import { Component } from '@angular/core';
import { Rect } from '../../app/core/rect';
import { SceneObject } from '../scene/scene-object';
import { ISceneObject } from '../scene/scene.model';
import { SceneObjectBehavior } from './scene-object-behavior';

@Component({
  selector: 'collision-behavior',
  template: `<ng-content></ng-content>`,
})
export class CollisionBehaviorComponent extends SceneObjectBehavior {
  collideBox: Rect = new Rect(0, 0, 1, 1);
  resultsArray: any[] = [];

  collide<T extends ISceneObject = ISceneObject>(
    x: number,
    y: number,
    type: Function = SceneObject,
    results: T[] = [],
  ): boolean {
    if (!this.host || !this.host.scene) {
      return false;
    }
    this.collideBox.point.x = x;
    this.collideBox.point.y = y;
    return this.host.scene.db.queryRect(this.collideBox, type, results);
  }

  collideFirst(x: number, y: number, type: Function = SceneObject): SceneObject | null {
    if (!this.host || !this.host.scene) {
      return null;
    }
    this.collideBox.point.x = x;
    this.collideBox.point.y = y;
    this.resultsArray.length = 0;
    const hit: boolean = this.host.scene.db.queryRect(
      this.collideBox,
      type,
      this.resultsArray,
    );
    return hit ? this.resultsArray[0] : null;
  }
}

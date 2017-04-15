/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {SceneObject} from '../../game/pow2/scene/scene-object';
import {SceneObjectBehavior} from '../../game/pow2/scene/scene-object-behavior';
import {Rect} from '../../game/pow-core/rect';
import {Component} from '@angular/core';

@Component({
  selector: 'collision-behavior',
  template: `<ng-content></ng-content>`
})
export class CollisionBehaviorComponent extends SceneObjectBehavior {
  collideBox: Rect = new Rect(0, 0, 1, 1);
  resultsArray: any[] = [];

  collide(x: number, y: number, type: Function = SceneObject, results = []): boolean {
    if (!this.host || !this.host.scene) {
      return false;
    }
    this.collideBox.point.x = x;
    this.collideBox.point.y = y;
    return this.host.scene.db.queryRect(this.collideBox, type, results);
  }

  collideFirst(x: number, y: number, type: Function = SceneObject): SceneObject {
    if (!this.host || !this.host.scene) {
      return null;
    }
    this.collideBox.point.x = x;
    this.collideBox.point.y = y;
    this.resultsArray.length = 0;
    const hit: boolean = this.host.scene.db.queryRect(this.collideBox, type, this.resultsArray);
    return hit ? this.resultsArray[0] : null;
  }
}

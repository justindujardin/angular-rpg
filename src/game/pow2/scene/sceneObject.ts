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

import * as _ from 'underscore';
import {SceneComponent} from './sceneComponent';
import {Entity} from '../../pow-core/entity';
import {Scene} from './scene';
import {IWorld} from '../../pow-core/world';
import {Point} from '../../pow-core/point';
/**
 * An object that may exist in a `Scene` and receives time updates.
 */
export class SceneObject extends Entity {
  id: string;
  _uid: string = _.uniqueId('so');
  scene: Scene;
  world: IWorld;
  enabled: boolean;
  // The object point
  point: Point;
  size: Point;
  // The render point that is interpolated between ticks.
  renderPoint: Point;
  _components: SceneComponent[] = [];

  constructor(options?: any) {
    super();
    _.extend(this, _.defaults(options || {}), {
      point: new Point(0, 0),
      size: new Point(1, 1),
      enabled: true
    });
  }

  // Tick components.
  tick(elapsed: number) {
    if (!this.enabled) {
      return;
    }
    var values: any[] = this._components;
    var l: number = this._components.length;
    for (var i = 0; i < l; i++) {
      if (!values[i]) {
        throw new Error("Component deleted during tick, use _.defer to delay removal until the callstack unwinds");
      }
      values[i].tick && values[i].tick(elapsed);
    }
  }

  // Interpolate components.
  interpolateTick(elapsed: number) {
    if (!this.enabled) {
      return;
    }
    var values: any[] = this._components;
    var l: number = this._components.length;
    for (var i = 0; i < l; i++) {
      if (!values[i]) {
        throw new Error("Component deleted during interpolateTick, use _.defer to delay removal until the callstack unwinds");
      }
      values[i].interpolateTick && values[i].interpolateTick(elapsed);
    }
  }

  destroy() {
    _.each(this._components, (o: SceneComponent) => {
      o.disconnectComponent();
    });
    this._components.length = 0;
    if (this.scene) {
      this.scene.removeObject(this, false);
    }
  }

  onAddToScene(scene: Scene) {
    this.syncComponents();
  }

  addComponentDictionary(components: any, silent?: boolean): boolean {
    var failed: SceneComponent = null;
    _.each(components, (comp: SceneComponent, key: string) => {
      if (failed) {
        return;
      }
      if (!this.addComponent(comp, true)) {
        failed = comp;
      }
    });
    if (failed) {
      console.log("Failed to add component set to host. Component " + failed.toString() + " failed to connect to host.");
    }
    else {
      this.syncComponents();
    }
    return !failed;
  }

  removeComponentDictionary(components: any, silent?: boolean): boolean {
    var previousCount: number = this._components.length;
    var removeIds: string[] = _.map(components, (value: SceneComponent) => {
      return value.id;
    });
    this._components = _.filter(this._components, (obj: SceneComponent) => {
      if (_.indexOf(removeIds, obj.id) !== -1) {
        if (obj.disconnectComponent() === false) {
          return true;
        }
        obj.host = null;
        return false;
      }
      return true;
    });
    var change: boolean = this._components.length === previousCount;
    if (change && silent !== true) {
      this.syncComponents();
    }
    return change;
  }

  // Debugging
  // -----------------------------------------------------------------------------
  toString(): string {
    var ctor: any = this.constructor;
    var name: string = this.name;
    if (ctor && ctor.name != "Function") {
      name = ctor.name || (this.toString().match(/function (.+?)\(/) || [, ''])[1];
    }
    _.each(this._components, (comp: SceneComponent) => {
      name += ', ' + comp;
    });
    return name;
  }
}

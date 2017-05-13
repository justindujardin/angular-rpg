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
import {SceneObjectBehavior} from './scene-object-behavior';
import {BehaviorHost} from '../../pow-core/behavior-host';
import {Scene} from './scene';
import {IPoint, Point} from '../../pow-core/point';
/**
 * An object that may exist in a `Scene` and receives time updates.
 */
export class SceneObject extends BehaviorHost {
  private static objectCount: number = 0;
  _uid: string = `scene-object-${SceneObject.objectCount++}`;
  scene: Scene;
  enabled: boolean;
  // The object point
  point: IPoint;
  size: IPoint;
  // The render point that is interpolated between ticks.
  renderPoint: IPoint;

  constructor(options?: any) {
    super();
    _.extend(this, _.defaults(options || {}), {
      point: new Point(0, 0),
      size: new Point(1, 1),
      enabled: true
    });
  }

  // Tick map.
  tick(elapsed: number) {
    if (!this.enabled) {
      return;
    }
    const values: any[] = this._connectedBehaviors;
    const l: number = this._connectedBehaviors.length;
    for (let i = 0; i < l; i++) {
      if (!values[i]) {
        throw new Error('Component deleted during tick, use _.defer to delay removal until the callstack unwinds');
      }
      if (values[i].tick) {
        values[i].tick(elapsed);
      }
    }
  }

  // Interpolate map.
  interpolateTick(elapsed: number) {
    if (!this.enabled) {
      return;
    }
    const values: any[] = this._connectedBehaviors;
    const l: number = this._connectedBehaviors.length;
    for (let i = 0; i < l; i++) {
      if (!values[i]) {
        throw new Error('Component deleted during interpolateTick, delay removal until the callstack unwinds');
      }
      if (values[i].interpolateTick) {
        values[i].interpolateTick(elapsed);
      }
    }
  }

  destroy() {
    _.each(this._connectedBehaviors, (o: SceneObjectBehavior) => {
      o.disconnectBehavior();
    });
    this._connectedBehaviors.length = 0;
    if (this.scene) {
      this.scene.removeObject(this, false);
    }
  }

  onAddToScene(scene: Scene) {
    this.syncBehaviors();
  }

  addComponentDictionary(components: any, silent?: boolean): boolean {
    let failed: SceneObjectBehavior = null;
    _.each(components, (comp: SceneObjectBehavior, key: string) => {
      if (failed) {
        return;
      }
      if (!this.addBehavior(comp, true)) {
        failed = comp;
      }
    });
    if (failed) {
      console.log(`Failed to add component set to host. Component ${failed.toString()} failed to connect to host.`);
    }
    else {
      this.syncBehaviors();
    }
    return !failed;
  }

  removeComponentDictionary(components: any, silent?: boolean): boolean {
    const previousCount: number = this._connectedBehaviors.length;
    const removeIds: string[] = _.map(components, (value: SceneObjectBehavior) => {
      return value.id;
    });
    this._connectedBehaviors = _.filter(this._connectedBehaviors, (obj: SceneObjectBehavior) => {
      if (_.indexOf(removeIds, obj.id) !== -1) {
        if (obj.disconnectBehavior() === false) {
          return true;
        }
        obj.host = null;
        return false;
      }
      return true;
    });
    const change: boolean = this._connectedBehaviors.length === previousCount;
    if (change && silent !== true) {
      this.syncBehaviors();
    }
    return change;
  }

  // Debugging
  // -----------------------------------------------------------------------------
  toString(): string {
    const ctor: any = this.constructor;
    let name: string = this.name;
    if (ctor && ctor.name !== 'Function') {
      name = ctor.name || (this.toString().match(/function (.+?)\(/) || [, ''])[1];
    }
    _.each(this._connectedBehaviors, (comp: SceneObjectBehavior) => {
      name += ', ' + comp;
    });
    return name;
  }
}

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
import {errors} from './errors';
import {IBehavior, IBehaviorHost} from './behavior';
import {Events} from './events';

/**
 * An Entity object is a container for groups of components.
 *
 * Basic composite object that has a set of dynamic behaviors added to it through the
 * addition and removal of component objects.  Components may be looked up by type, and
 * may depend on siblings components for parts of their own behavior.
 */
export class Entity extends Events implements IBehaviorHost {
  id: string;
  name: string;

  _components: IBehavior[] = [];


  destroy() {
    _.each(this._components, (o: IBehavior) => {
      o.disconnectBehavior();
    });
    this._components.length = 0;
  }

  findBehavior(type: Function): IBehavior {
    var values: any[] = this._components;
    var l: number = this._components.length;
    for (var i = 0; i < l; i++) {
      var o: IBehavior = values[i];
      if (o instanceof type) {
        return o;
      }
    }
    return null;
  }

  findBehaviors(type: Function): IBehavior[] {
    var values: any[] = this._components;
    var results: IBehavior[] = [];
    var l: number = this._components.length;
    for (var i = 0; i < l; i++) {
      var o: IBehavior = values[i];
      if (o instanceof type) {
        results.push(o);
      }
    }
    return results;
  }

  findBehaviorsByName(name: string): IBehavior {
    var values: any[] = this._components;
    var l: number = this._components.length;
    for (var i = 0; i < l; i++) {
      var o: IBehavior = values[i];
      if (o.name === name) {
        return o;
      }
    }
    return null;
  }

  syncBehaviors() {
    var values: any[] = this._components;
    var l: number = this._components.length;
    for (var i = 0; i < l; i++) {
      values[i].syncBehavior();
    }
  }

  addBehavior(component: IBehavior, silent?: boolean): boolean {
    if (_.where(this._components, {id: component.id}).length > 0) {
      throw new Error(errors.ALREADY_EXISTS);
    }
    component.host = this;
    if (component.connectBehavior() === false) {
      delete component.host;
      return false;
    }
    this._components.push(component);
    if (silent !== true) {
      this.syncBehaviors();
    }
    return true;
  }

  removeBehaviorByType(componentType: any, silent: boolean = false): boolean {
    var component = this.findBehavior(componentType);
    if (!component) {
      return false;
    }
    return this.removeBehavior(component, silent);
  }

  removeBehavior(component: IBehavior, silent: boolean = false): boolean {
    var previousCount: number = this._components.length;
    this._components = _.filter(this._components, (obj: IBehavior) => {
      if (obj.id === component.id) {
        if (obj.disconnectBehavior() === false) {
          return true;
        }
        obj.host = null;
        return false;
      }
      return true;
    });
    var change: boolean = this._components.length !== previousCount;
    if (change && silent !== true) {
      this.syncBehaviors();
    }
    return change;
  }

}

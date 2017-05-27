import * as _ from 'underscore';
import {errors} from './errors';
import {IBehavior, IBehaviorHost} from './behavior';
import {Events} from './events';

/**
 * A BehaviorHost is a container for groups of components.
 *
 * Basic composite object that has a set of dynamic behaviors added to it through the
 * addition and removal of component objects.  Components may be looked up by type, and
 * may depend on siblings components for parts of their own behavior.
 */
export class BehaviorHost extends Events implements IBehaviorHost {
  id: string;
  name: string;

  _connectedBehaviors: IBehavior[] = [];

  destroy() {
    _.each(this._connectedBehaviors, (o: IBehavior) => {
      o.disconnectBehavior();
    });
    this._connectedBehaviors.length = 0;
  }

  findBehavior(type: Function): IBehavior {
    const values: any[] = this._connectedBehaviors;
    const l: number = this._connectedBehaviors.length;
    for (let i = 0; i < l; i++) {
      const o: IBehavior = values[i];
      if (o instanceof type) {
        return o;
      }
    }
    return null;
  }

  findBehaviors(type: Function): IBehavior[] {
    const values: any[] = this._connectedBehaviors;
    const results: IBehavior[] = [];
    const l: number = this._connectedBehaviors.length;
    for (let i = 0; i < l; i++) {
      const o: IBehavior = values[i];
      if (o instanceof type) {
        results.push(o);
      }
    }
    return results;
  }

  findBehaviorByName(name: string): IBehavior {
    const values: any[] = this._connectedBehaviors;
    const l: number = this._connectedBehaviors.length;
    for (let i = 0; i < l; i++) {
      const o: IBehavior = values[i];
      if (o.name === name) {
        return o;
      }
    }
    return null;
  }

  syncBehaviors() {
    const values: any[] = this._connectedBehaviors;
    const l: number = this._connectedBehaviors.length;
    for (let i = 0; i < l; i++) {
      values[i].syncBehavior();
    }
  }

  addBehavior(component: IBehavior, silent?: boolean): boolean {
    if (!component) {
      throw new Error(errors.REQUIRED_ARGUMENT);
    }
    if (_.where(this._connectedBehaviors, {id: component.id}).length > 0) {
      throw new Error(errors.ALREADY_EXISTS);
    }
    component.host = this;
    if (component.connectBehavior() === false) {
      delete component.host;
      return false;
    }
    this._connectedBehaviors.push(component);
    if (silent !== true) {
      this.syncBehaviors();
    }
    return true;
  }

  removeBehaviorByType(componentType: any, silent: boolean = false): boolean {
    const component = this.findBehavior(componentType);
    if (!component) {
      return false;
    }
    return this.removeBehavior(component, silent);
  }

  removeBehavior(component: IBehavior, silent: boolean = false): boolean {
    const previousCount: number = this._connectedBehaviors.length;
    this._connectedBehaviors = _.filter(this._connectedBehaviors, (obj: IBehavior) => {
      if (obj.id === component.id) {
        if (obj.disconnectBehavior() === false) {
          return true;
        }
        obj.host = null;
        return false;
      }
      return true;
    });
    const change: boolean = this._connectedBehaviors.length !== previousCount;
    if (change && silent !== true) {
      this.syncBehaviors();
    }
    return change;
  }

}

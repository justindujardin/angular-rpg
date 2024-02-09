import * as _ from 'underscore';
import { BehaviorHost } from './behavior-host';
/**
 * Most basic object.  Has an id and a name.
 */
export interface IObject {
  id: string;
  name: string | null;
}

/**
 * Basic component interface.  Supports component host lifetime implementations, and
 * hot-swapping map.
 */
export interface IBehavior extends IObject {
  /**
   * The host object that this component belongs to.
   */
  host: IObject | null;

  /**
   * Connect this component to its host.  Initialization logic goes here.
   */
  connectBehavior(): boolean;
  /**
   * Disconnect this component from its host.  Destruction logic goes here.
   */
  disconnectBehavior(): boolean;

  /**
   * Behaviors on the host have changed.  If this component depends on other
   * host object map, the references to them should be looked up and
   * stored here.
   */
  syncBehavior(): boolean;
}

/**
 * Basic component host object interface.  Exposes methods for adding/removing/searching
 * map that a host owns.
 */
export interface IBehaviorHost extends IObject {
  addBehavior(component: IBehavior, silent?: boolean): boolean;
  removeBehavior(component: IBehavior, silent?: boolean): boolean;

  syncBehaviors(): void;

  findBehavior<T extends IBehavior>(type: Function): T | null;
  findBehaviors<T extends IBehavior>(type: Function): T[];

  findBehaviorByName(name: string): IBehavior | null;
}

/**
 * Simplest ISceneBehavior implementation.  Because Typescript interfaces are compile
 * time constructs, we have to have an actual implementation to instanceof.  For that
 * reason, all SceneBehaviors should derive this class.
 */
export class Behavior implements IBehavior {
  id: string = _.uniqueId('sc');
  host: BehaviorHost | null;
  name: string | null;

  connectBehavior(): boolean {
    return true;
  }

  disconnectBehavior(): boolean {
    return true;
  }

  syncBehavior(): boolean {
    return true;
  }

  toString(): string {
    if (this.name) {
      return this.name;
    }
    const ctor: any = this.constructor;
    const ctorString: string = ctor ? ctor.toString().match(/function (.+?)\(/) : null;
    if (ctor && ctor.name) {
      return ctor.name;
    } else if (ctorString && ctorString[1]) {
      return ctorString[1];
    } else {
      return 'Behavior';
    }
  }
}

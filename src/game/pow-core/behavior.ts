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
import {BehaviorHost} from './behavior-host';
import {Events} from './events';
import * as _ from 'underscore';
/**
 * Most basic object.  Has an id and a name.
 */
export interface IObject {
  id: string;
  name: string;
}

/**
 * Basic component interface.  Supports component host lifetime implementations, and
 * hot-swapping map.
 */
export interface IBehavior extends IObject {

  /**
   * The host object that this component belongs to.
   */
  host: IObject;

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

  syncBehaviors();

  findBehavior(type: Function): IBehavior;
  findBehaviors(type: Function): IBehavior[];

  findBehaviorByName(name: string): IBehavior;
}

/**
 * Simplest ISceneBehavior implementation.  Because Typescript interfaces are compile
 * time constructs, we have to have an actual implementation to instanceof.  For that
 * reason, all SceneBehaviors should derive this class.
 */
export class Behavior extends Events implements IBehavior {
  id: string = _.uniqueId('sc');
  host: BehaviorHost;
  name: string;

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
    const ctor: any = this.constructor;
    const ctorString: string = ctor ? ctor.toString().match(/function (.+?)\(/) : null;
    if (ctor && ctor.name) {
      return ctor.name;
    }
    else if (ctorString && ctorString[1]) {
      return ctorString[1];
    } else {
      return this.name;
    }
  }
}

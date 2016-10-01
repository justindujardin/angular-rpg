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

import {Entity} from './entity';
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
 * hot-swapping components.
 */
export interface IComponent extends IObject {

  /**
   * The host object that this component belongs to.
   */
  host: IObject;

  /**
   * Connect this component to its host.  Initialization logic goes here.
   */
  connectComponent(): boolean;
  /**
   * Disconnect this component from its host.  Destruction logic goes here.
   */
  disconnectComponent(): boolean;

  /**
   * Components on the host have changed.  If this component depends on other
   * host object components, the references to them should be looked up and
   * stored here.
   */
  syncComponent(): boolean;
}

/**
 * Basic component host object interface.  Exposes methods for adding/removing/searching
 * components that a host owns.
 */
export interface IComponentHost extends IObject {
  addComponent(component: IComponent, silent?: boolean): boolean;
  removeComponent(component: IComponent, silent?: boolean): boolean;

  syncComponents();

  findComponent(type: Function): IComponent;
  findComponents(type: Function): IComponent[];

  findComponentByName(name: string): IComponent;
}


/**
 * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
 * time constructs, we have to have an actual implementation to instanceof.  For that
 * reason, all SceneComponents should derive this class.
 */
export class Component extends Events implements IComponent {
  id: string = _.uniqueId('sc');
  host: Entity;
  name: string;

  connectComponent(): boolean {
    return true;
  }

  disconnectComponent(): boolean {
    return true;
  }

  syncComponent(): boolean {
    return true;
  }

  toString(): string {
    var ctor: any = this.constructor;
    var ctorString: string = ctor ? ctor.toString().match(/function (.+?)\(/) : null;
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

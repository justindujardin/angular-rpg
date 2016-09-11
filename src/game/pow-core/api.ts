/*
 Copyright (C) 2013-2015 by Justin DuJardin

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

import {errors} from './errors';


var _worldLookup: { [name: string]: any } = {};

/**
 * Module level world accessor.
 */
export function getWorld<T>(name: string): T {
  return <T>_worldLookup[name];
}

/**
 * Module level world setter.
 */
export function registerWorld(name: string, instance: any) {
  if (!name) {
    throw new Error(errors.REQUIRED_ARGUMENT);
  }
  if (_worldLookup.hasOwnProperty(name)) {
    throw new Error(errors.ALREADY_EXISTS);
  }
  _worldLookup[name] = instance;
  return _worldLookup[name];
}

/**
 * Module level world remover.
 */
export function unregisterWorld(name: string) {
  if (!name) {
    throw new Error(errors.REQUIRED_ARGUMENT);
  }
  if (!_worldLookup.hasOwnProperty(name)) {
    throw new Error(errors.INVALID_ARGUMENTS);
  }
  var instance: any = _worldLookup[name];
  delete _worldLookup[name];
  return instance;
}

export function clearWorlds() {
  _worldLookup = {};
}

/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import { Injectable } from '@angular/core';
import { Time } from './time';

export interface IWorld {
  time: Time;
  mark(object?: IWorldObject): void;
  erase(object?: IWorldObject): void;
  setService(name: string, value: IWorldObject): IWorldObject;
}
export interface IWorldObject {
  world: IWorld | null;
  onAddToWorld?(world: IWorld): void;
  onRemoveFromWorld?(world: IWorld): void;
}

@Injectable()
export class World implements IWorld {
  time: Time = Time.get();

  setService(name: string, value: IWorldObject): IWorldObject {
    this.mark(value);
    (this as any)[name] = value;
    return value;
  }

  mark(object?: IWorldObject) {
    if (object) {
      object.world = this;
      if (object.onAddToWorld) {
        object.onAddToWorld(this);
      }
    }
  }

  erase(object?: IWorldObject) {
    if (object) {
      if (object.onRemoveFromWorld) {
        object.onRemoveFromWorld(this);
      }
      object.world = null;
    }
  }
}

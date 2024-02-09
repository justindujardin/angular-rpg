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

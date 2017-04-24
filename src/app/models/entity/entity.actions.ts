import {type} from '../util';
import {Action} from '@ngrx/store';
import {BaseEntity} from '../base-entity';
import {Item} from '../item';
import {Entity} from './entity.model';

export const EntityActionTypes = {
  ADD_BEING: type('rpg/entity/being/add'),
  REMOVE_BEING: type('rpg/entity/being/remove'),
  ADD_ITEM: type('rpg/entity/item/create'),
  REMOVE_ITEM: type('rpg/entity/item/remove'),
  ADD_OBJECTIVE: type('rpg/entity/objective/create'),
  REMOVE_OBJECTIVE: type('rpg/entity/objective/remove'),
  LEVEL_UP: type('rpg/entity/levelup')
};
export class EntityAddBeingAction implements Action {
  type: string = EntityActionTypes.ADD_BEING;

  constructor(public payload: BaseEntity) {

  }
}
export class EntityRemoveBeingAction implements Action {
  type: string = EntityActionTypes.REMOVE_BEING;
  payload: string;

  constructor(entityId: string) {
    this.payload = entityId;
  }
}

export class EntityAddItemAction implements Action {
  type: string = EntityActionTypes.ADD_ITEM;

  constructor(public payload: Item) {

  }
}

export class EntityRemoveItemAction implements Action {
  type: string = EntityActionTypes.REMOVE_ITEM;
  payload: string;

  constructor(entityId: string) {
    this.payload = entityId;
  }
}

export class EntityLevelUpAction implements Action {
  type: string = EntityActionTypes.LEVEL_UP;
  payload: {
    eid: string;
    changes: Partial<Entity>
  };

  constructor(entityId: string, changes: Partial<Entity>) {
    this.payload = {
      eid: entityId,
      changes
    };
  }
}

export type EntityActions = EntityAddBeingAction |
  EntityRemoveBeingAction |
  EntityAddItemAction |
  EntityRemoveItemAction;

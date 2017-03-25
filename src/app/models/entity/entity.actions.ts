import {type} from '../util';
import {Action} from '@ngrx/store';
import {BaseEntity} from '../being';
import {Item} from '../item';

export const LEVEL_EXPERIENCE_REQUIREMENTS = [
  0,
  32,
  96,
  208,
  400,
  672,
  1056,
  1552,
  2184,
  2976
];
export const PARTY_ARMOR_TYPES: string[] = [
  'head', 'body', 'arms', 'feet', 'accessory'
];
export function getXPForLevel(level: number): number {
  if (level === 0) {
    return 0;
  }
  return LEVEL_EXPERIENCE_REQUIREMENTS[level - 1];
}

//

export const EntityActionTypes = {
  ADD_BEING: type('rpg/entity/being/add'),
  REMOVE_BEING: type('rpg/entity/being/remove'),
  ADD_ITEM: type('rpg/entity/item/create'),
  REMOVE_ITEM: type('rpg/entity/item/remove'),
  ADD_OBJECTIVE: type('rpg/entity/objective/create'),
  REMOVE_OBJECTIVE: type('rpg/entity/objective/remove'),
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

export type EntityActionClasses = EntityAddBeingAction |
  EntityRemoveBeingAction |
  EntityAddItemAction |
  EntityRemoveItemAction;

import {type} from '../util';
import {Action} from '@ngrx/store';
import {Entity} from './entity.model';

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
  ADD_ENTITY: type('rpg/entity/create'),
  REMOVE_ENTITY: type('rpg/entity/remove')
};

export interface IEntityAddPayload {
  entity: Entity;
  collection: string;
}

export class EntityAddAction implements Action {
  type: string = EntityActionTypes.ADD_ENTITY;
  payload: IEntityAddPayload;

  constructor(entity: Entity, collection: string) {
    this.payload = {entity, collection};
  }
}

export interface IEntityRemovePayload {
  entityId: string;
  collection: string;
}

export class EntityRemoveAction implements Action {
  type: string = EntityActionTypes.REMOVE_ENTITY;
  payload: IEntityRemovePayload;

  constructor(entityId: string, collection: string) {
    this.payload = {entityId, collection};
  }
}

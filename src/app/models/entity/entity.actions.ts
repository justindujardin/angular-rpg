import { Action } from '@ngrx/store';
import { IEntityObject } from '../base-entity';
import { Item } from '../item';
import { type } from '../util';

export class EntityAddBeingAction implements Action {
  static typeId: 'ENTITY_ADD_BEING' = type('ENTITY_ADD_BEING');
  readonly type = EntityAddBeingAction.typeId;

  constructor(public payload: IEntityObject) {}
}
export class EntityRemoveBeingAction implements Action {
  static typeId: 'ENTITY_REMOVE_BEING' = type('ENTITY_REMOVE_BEING');
  type = EntityRemoveBeingAction.typeId;
  payload: string;

  constructor(entityId: string) {
    this.payload = entityId;
  }
}

export class EntityAddItemAction implements Action {
  static typeId: 'ENTITY_ADD_ITEM' = type('ENTITY_ADD_ITEM');
  type = EntityAddItemAction.typeId;

  constructor(public payload: Item) {}
}

export class EntityRemoveItemAction implements Action {
  static typeId: 'ENTITY_REMOVE_ITEM' = type('ENTITY_REMOVE_ITEM');
  type = EntityRemoveItemAction.typeId;

  payload: string;

  constructor(entityId: string) {
    this.payload = entityId;
  }
}

export type EntityActions =
  | EntityAddBeingAction
  | EntityRemoveBeingAction
  | EntityAddItemAction
  | EntityRemoveItemAction;

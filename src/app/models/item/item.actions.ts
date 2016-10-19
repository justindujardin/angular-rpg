import {Action} from '@ngrx/store';
import {type} from '../util';
import {Item} from './item.model';


export const ItemActionTypes = {
  ADD: type('rpg/item/add'),
  REMOVE: type('rpg/item/remove')
};

export class ItemAddAction implements Action {
  type = ItemActionTypes.ADD;

  constructor(public payload: Item) {
  }
}

export class ItemRemoveAction implements Action {
  type = ItemActionTypes.REMOVE;

  constructor(public payload: Item) {
  }
}

export type ItemActions
  = ItemAddAction
  | ItemRemoveAction

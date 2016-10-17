import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {Item} from './item.model';

@Injectable()

export class ItemActions {

  static ADD = '[Item] Add Item';

  addItem(item: Item): Action {
    return {
      type: ItemActions.ADD,
      payload: item
    };
  }

  static REMOVE = '[Item] Remove Item';

  removeItem(item: Item): Action {
    return {
      type: ItemActions.REMOVE,
      payload: item
    };
  }
}

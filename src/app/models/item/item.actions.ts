import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {Item} from './item.model';

@Injectable()

export class ItemActions {

  static ADD = 'rpg/item/add';

  addItem(item: Item): Action {
    return {
      type: ItemActions.ADD,
      payload: item
    };
  }

  static REMOVE = 'rpg/item/remove';

  removeItem(item: Item): Action {
    return {
      type: ItemActions.REMOVE,
      payload: item
    };
  }
}

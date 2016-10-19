import {Action} from '@ngrx/store';
import {ItemActionTypes} from './item.actions';
import {Item} from './item.model';
import * as Immutable from 'immutable';

export interface ItemState {
  inventory: Item[];
}

const initialState: ItemState = {
  inventory: []
};

export function itemReducer(state: ItemState = initialState, action: Action): ItemState {
  switch (action.type) {
    case ItemActionTypes.ADD: {
      const items = Immutable.List(state.inventory).push(action.payload).toArray();
      return Immutable.fromJS({inventory: items}).toJS();
    }
    case ItemActionTypes.REMOVE: {

      //
      //
      //
      // TODO: Selling items at store is busted.  Test this up.
      //
      //
      //

      // Drop just the first matching item with the given id
      let found = false;
      const items = Immutable.List(state.inventory).filter((i: Item) => {
        let match = i.id === action.payload.id;
        if (match && !found) {
          found = true;
          return false;
        }
        return true;
      }).toArray();
      return Immutable.fromJS({inventory: items}).toJS();
    }
    default:
      return state;
  }
}

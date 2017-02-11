import {ItemState, itemReducer} from "./item.reducer";
import {ItemRemoveAction, ItemAddAction} from "./item.actions";
import {Item} from "./item.model";
function defaultState(overrides?: any): ItemState {
  return Object.assign({}, {
    inventory: []
  }, overrides || {});
}

describe('Item', () => {
  const testItem: Item = {
    id: 'test-item',
    name: 'Test Item',
    cost: 1337,
    icon: 'test-icon.png',
    usedby: []
  };
  describe('Actions', () => {
    describe('ItemAddAction', () => {
      it('should add an item to the inventory', () => {
        const state = defaultState();
        const expected = defaultState({
          inventory: [testItem]
        });
        const actual = itemReducer(state, new ItemAddAction(testItem));
        expect(actual).toEqual(expected);
      });
    });

    describe('ItemRemoveAction', () => {
      it('should remove an item to the inventory', () => {
        const state = defaultState({
          inventory: [testItem]
        });
        const expected = defaultState({
          inventory: []
        });
        const actual = itemReducer(state, new ItemRemoveAction(testItem));
        expect(actual).toEqual(expected);
      });
    });

  });
});

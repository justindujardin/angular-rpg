import {gameStateFactory, gameStateReducer} from './game-state.reducer';
import {GameState} from './game-state.model';
import {
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
  GameStateBoardShipAction,
  GameStateEquipItemAction,
  GameStateHealPartyAction,
  GameStateMoveAction,
  GameStateNewAction,
  GameStateRemoveInventoryAction,
  GameStateSetKeyDataAction,
  GameStateTravelAction,
  GameStateUnequipItemAction
} from './game-state.actions';
import {Item} from '../item';
import {entityId} from '../game-data/game-data.model';
import * as Immutable from 'immutable';
import {pointFactory} from '../records';
const itemId: string = 'test-item-fake';

function fakeItem(uniqueId: string = itemId): Item {
  const id: string = 'test-item-' + uniqueId;
  const testItem: Partial<Item> = {
    id,
    eid: entityId(id)
  };
  return Object.assign({}, testItem as Item);
}

describe('GameState', () => {
  describe('Actions', () => {
    xdescribe('GameStateNewAction', () => {
      it('should overwrite entire gameState with payload', () => {
        const state = gameStateFactory();
        const expected = gameStateFactory({
          party: Immutable.List<string>(['1', '2', '3']),
          gold: 1337
        });
        const actual = gameStateReducer(state, new GameStateNewAction(expected));
        expect(actual).toEqual(expected);
      });
    });

    describe('GameStateHealPartyAction', () => {
      it('should deduct healing cost from game state gold', () => {
        const state = gameStateFactory({
          gold: 100
        });
        const actual = gameStateReducer(state, new GameStateHealPartyAction({
          cost: 50,
          partyIds: []
        }));
        expect(actual.gold).toEqual(50);
      });
    });

    describe('GameStateEquipItemAction', () => {
      it('should throw if item to equip does not currently exist in inventory', () => {
        const state = gameStateFactory({
          party: Immutable.List<string>(['fooUser'])
        });
        expect(() => {
          gameStateReducer(state, new GameStateEquipItemAction({
            slot: 'weapon',
            itemId: 'foo',
            entityId: 'fooUser'
          }));
        }).toThrow();
      });
      it('should throw if entity to equip item on is not in the party', () => {
        const state = gameStateFactory();
        expect(() => {
          gameStateReducer(state, new GameStateEquipItemAction({
            slot: 'weapon',
            itemId: 'foo',
            entityId: 'asd'
          }));
        }).toThrow();
      });
      it('should remove item from inventory when equipped', () => {
        const state = gameStateFactory({
          inventory: Immutable.List<string>(['foo']),
          party: Immutable.List<string>(['fooUser'])
        });
        expect(state.inventory.count()).toBe(1);
        const actual = gameStateReducer(state, new GameStateEquipItemAction({
          slot: 'weapon',
          itemId: 'foo',
          entityId: 'fooUser'
        }));
        expect(actual.inventory.count()).toBe(0);
      });
    });

    describe('GameStateUnequipItemAction', () => {
      it('should throw if item already exists in inventory', () => {
        const state = gameStateFactory({
          inventory: Immutable.List<string>(['foo'])
        });
        expect(() => {
          gameStateReducer(state, new GameStateUnequipItemAction({
            slot: 'weapon',
            itemId: 'foo',
            entityId: ''
          }));
        }).toThrow();
      });
      it('should throw if user to unequip from is not in the party', () => {
        const state = gameStateFactory();
        expect(() => {
          gameStateReducer(state, new GameStateUnequipItemAction({
            slot: 'weapon',
            itemId: 'foo',
            entityId: 'asd'
          }));
        }).toThrow();
      });
      it('should add item to inventory when unequipped', () => {
        const state = gameStateFactory({
          party: Immutable.List<string>(['fooUser'])
        });
        expect(state.inventory.count()).toBe(0);
        const actual = gameStateReducer(state, new GameStateUnequipItemAction({
          slot: 'weapon',
          itemId: 'foo',
          entityId: 'fooUser'
        }));
        expect(actual.inventory.count()).toBe(1);
      });
    });

    describe('GameStateSetKeyDataAction', () => {
      it('should set a new key/value pair if none exist', () => {
        const state = gameStateFactory();
        const newKey = 'testKey';
        const newValue = true;
        expect(state.keyData.get(newKey)).toBeUndefined();
        const newState = gameStateReducer(state, new GameStateSetKeyDataAction(newKey, newValue));
        expect(newState.keyData.get(newKey)).toBe(newValue);
      });
      it('should update an existing keys value if it already exists', () => {
        const state = gameStateFactory({
          keyData: Immutable.Map<string, any>({
            testKey: true
          })
        });
        const keyName = 'testKey';
        expect(state.keyData.get(keyName)).toBe(true);
        const newState = gameStateReducer(state, new GameStateSetKeyDataAction(keyName, false));
        expect(newState.keyData.get(keyName)).toBe(false);
      });
    });

    describe('GameStateTravelAction', () => {
      it('should update the current world map', () => {
        const state = gameStateFactory({
          location: 'firstMap'
        });
        const newMap = 'newMap';
        const actual = gameStateReducer(state, new GameStateTravelAction({
          location: newMap,
          position: state.position
        }));
        expect(actual.location).toBe(newMap);
      });
      it('should update the player position', () => {
        const state = gameStateFactory({
          position: pointFactory({x: 0, y: 0})
        });
        const expected = pointFactory({x: 10, y: 10});
        const actual = gameStateReducer(state, new GameStateTravelAction({
          location: '',
          position: expected
        }));
        expect(actual.position).toEqual(expected);
      });
    });

    describe('GameStateAddGoldAction', () => {
      it('should add gold when given a positive number', () => {
        const state = gameStateFactory({gold: 100});
        const actual = gameStateReducer(state, new GameStateAddGoldAction(10));
        expect(actual.gold).toBe(110);
      });
      it('should subtract gold when given a negative number', () => {
        const state = gameStateFactory({gold: 100});
        const actual = gameStateReducer(state, new GameStateAddGoldAction(-10));
        expect(actual.gold).toBe(90);
      });
    });
    describe('GameStateMoveAction', () => {
      it('should update the player position', () => {
        const state = gameStateFactory({
          position: {x: 0, y: 0}
        });
        const expected = pointFactory({x: 10, y: 10});
        const actual = gameStateReducer(state, new GameStateMoveAction(expected));
        expect(actual.position).toEqual(expected);
      });
      it('should update shipPosition when boardedShip is true', () => {
        const state = gameStateFactory({
          position: {x: 0, y: 0},
          shipPosition: {x: 0, y: 0},
          boardedShip: true
        });
        const expected = pointFactory({x: 10, y: 10});
        const actual = gameStateReducer(state, new GameStateMoveAction(expected));
        expect(actual.position).toEqual(expected);
        expect(actual.shipPosition).toEqual(expected);
      });
    });
    describe('GameStateBoardShipAction', () => {
      it('should toggle boardedShip boolean', () => {
        [true, false].forEach((value) => {
          const state = gameStateFactory({
            boardedShip: value
          });
          const expected = !value;
          const actual = gameStateReducer(state, new GameStateBoardShipAction(expected));
          expect(actual.boardedShip).toEqual(expected);
        });
      });
    });
    describe('GameStateAddInventoryAction', () => {
      it('should store the id of the given item in the inventory array', () => {
        const state = gameStateFactory();
        const item = fakeItem();
        const actual = gameStateReducer(state, new GameStateAddInventoryAction(item));
        expect(actual.inventory.indexOf(item.eid)).toBeGreaterThan(-1);
      });
      it('should throw if item already exists in inventory', () => {
        const item = fakeItem();
        const state = gameStateFactory({
          inventory: Immutable.List<string>([item.eid])
        });
        expect(() => {
          gameStateReducer(state, new GameStateAddInventoryAction(item));
        }).toThrow();
      });
      it('should throw if item is invalid', () => {
        const state = gameStateFactory();
        expect(() => {
          gameStateReducer(state, new GameStateAddInventoryAction(null));
        }).toThrow();
      });
      it('should throw if item is missing "id" template identifier', () => {
        const state = gameStateFactory();
        expect(() => {
          const item: any = fakeItem();
          delete item.id;
          gameStateReducer(state, new GameStateAddInventoryAction(item));
        }).toThrow();
      });
      it('should throw if item is missing "eid" instance identifier', () => {
        const state = gameStateFactory();
        expect(() => {
          const item = fakeItem();
          delete item.eid;
          gameStateReducer(state, new GameStateAddInventoryAction(item));
        }).toThrow();
      });
    });
    describe('GameStateRemoveInventoryAction', () => {
      it('should remove the given item by id from the inventory array', () => {
        const item = fakeItem();
        const state = gameStateFactory({
          inventory: Immutable.List<string>([item.eid])
        });
        const actual = gameStateReducer(state, new GameStateRemoveInventoryAction(item));
        expect(actual.inventory.count()).toBe(0);
      });
      it('should throw if asked to remove an item that is not in the inventory', () => {
        const item = fakeItem();
        const state = gameStateFactory();
        expect(() => {
          gameStateReducer(state, new GameStateRemoveInventoryAction(item));
        }).toThrow();
      });
    });

  });
});

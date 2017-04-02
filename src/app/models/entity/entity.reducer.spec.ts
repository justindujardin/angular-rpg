import {EntityState, entityReducer} from './entity.reducer';
import {Entity} from './entity.model';
import {
  EntityAddBeingAction,
  EntityRemoveBeingAction,
  EntityAddItemAction,
  EntityRemoveItemAction
} from './entity.actions';
import {Item} from '../item';
import {EntityCollection} from '../base-entity';

describe('Entity', () => {

  const testId: string = 'testid1234';

  function defaultState(collection?: string, values?: Partial<EntityCollection<any>>): EntityState {
    const resultState: EntityState = {
      beings: {
        byId: {},
        allIds: []
      },
      items: {
        byId: {},
        allIds: []
      }
    };
    if (collection && values) {
      return Object.assign(resultState, {
        [collection]: Object.assign(values)
      });
    }
    return Object.assign({}, resultState);
  }

  function fakeEntity(): Entity {
    const baseEntity: Entity = {
      exp: 0,
      level: 0,
      type: 'npc',
      icon: 'invalid.png',
      eid: testId,
      baseattack: 0,
      basedefense: 0,
      basemagic: 0,
      basespeed: 0,
      attack: 0,
      defense: 0,
      magic: 0,
      speed: 0,
      mp: 0,
      maxmp: 0,
      hp: 0,
      maxhp: 0
    };
    return Object.assign({}, baseEntity);
  }

  function fakeItem(): Item {
    const testItem: Item = {
      eid: 'unique-item-id',
      category: 'item',
      id: 'test-item',
      name: 'Test Item',
      level: 1,
      value: 1337,
      icon: 'test-icon.png',
      usedby: []
    };
    return Object.assign({}, testItem);
  }

  describe('Actions', () => {

    //
    // Beings
    //
    describe('EntityAddBeingAction', () => {
      it('should add an entity to the collection', () => {
        const initial: EntityState = defaultState();
        const entity = fakeEntity();
        const desired: EntityState = defaultState('beings', {
          allIds: [testId],
          byId: {testId: entity}
        });
        const out = entityReducer(initial, new EntityAddBeingAction(entity));
        expect(out).toEqual(desired);
      });
    });
    describe('EntityRemoveBeingAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const initial: EntityState = defaultState('beings', {
          allIds: [testId],
          byId: {testId: fakeEntity()}
        });
        const out = entityReducer(initial, new EntityRemoveBeingAction(testId));
        expect(out).toEqual(defaultState());
      });
      it('should do nothing if an entity is not found by the given id', () => {
        const initial: EntityState = defaultState('beings', {
          allIds: [testId],
          byId: {testId: fakeEntity()}
        });
        const out = entityReducer(initial, new EntityRemoveBeingAction('invalid-id'));
        expect(out).toEqual(initial);
      });
    });

    //
    // Items
    //
    describe('EntityAddItemAction', () => {
      it('should add an entity to the collection', () => {
        const initial: EntityState = defaultState();
        const item: Item = fakeItem();
        const desired: EntityState = defaultState('items', {
          allIds: [testId],
          byId: {testId: item}
        });
        const out = entityReducer(initial, new EntityAddItemAction(item));
        expect(out).toEqual(desired);
      });
    });
    describe('EntityRemoveItemAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const initial: EntityState = defaultState('items', {
          allIds: [testId],
          byId: {testId: fakeItem()}
        });
        const out = entityReducer(initial, new EntityRemoveItemAction(testId));
        expect(out).toEqual(defaultState());
      });
      it('should do nothing if an entity is not found by the given id', () => {
        const initial: EntityState = defaultState('items', {
          allIds: [testId],
          byId: {testId: fakeItem()}
        });
        const out = entityReducer(initial, new EntityRemoveItemAction('invalid-id'));
        expect(out).toEqual(initial);
      });
    });
  });
});

import {EntityState, entityReducer, EntityCollection} from './entity.reducer';
import {Entity} from './entity.model';
import {
  EntityAddBeingAction,
  EntityRemoveBeingAction,
  EntityAddItemAction,
  EntityRemoveItemAction
} from './entity.actions';
import {Item} from '../item';

describe('Entity', () => {
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

  function fakeEntity(values?: Partial<Entity>): Entity {
    const baseEntity: Entity = {
      exp: 0,
      level: 0,
      type: 'npc',
      icon: 'invalid.png',
      eid: 'test-id',
      baseAttack: 0,
      baseDefense: 0,
      baseMagic: 0,
      baseSpeed: 0,
      attack: 0,
      defense: 0,
      magic: 0,
      speed: 0,
      mp: 0,
      maxmp: 0,
      hp: 0,
      maxhp: 0
    };
    return Object.assign(baseEntity, values || {});
  }

  const testItem: Item = {
    eid: 'unique-item-id',
    id: 'test-item',
    name: 'Test Item',
    cost: 1337,
    icon: 'test-icon.png',
    usedby: []
  };

  describe('Actions', () => {
    describe('EntityAddBeingAction', () => {
      it('should add an entity to the collection', () => {
        const initial: EntityState = defaultState();
        const entity = fakeEntity();
        const desired: EntityState = defaultState('beings', {
          allIds: ['test-id'],
          byId: {'test-id': entity}
        });
        const out = entityReducer(initial, new EntityAddBeingAction(entity));
        expect(out).toEqual(desired);
      });
    });
    describe('EntityRemoveBeingAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const initial: EntityState = defaultState('beings', {
          allIds: ['test-id'],
          byId: {'test-id': fakeEntity()}
        });
        const out = entityReducer(initial, new EntityRemoveBeingAction('test-id'));
        expect(out).toEqual(defaultState());
      });
      it('should do nothing if an entity is not found by the given id', () => {
        const initial: EntityState = defaultState('beings', {
          allIds: ['test-id'],
          byId: {'test-id': fakeEntity()}
        });
        const out = entityReducer(initial, new EntityRemoveBeingAction('invalid-id'));
        expect(out).toEqual(initial);
      });
    });
    describe('EntityAddItemAction', () => {
      it('should add an entity to the collection', () => {
        const initial: EntityState = defaultState();
        const desired: EntityState = defaultState('items', {
          allIds: ['test-id'],
          byId: {'test-id': testItem}
        });
        const out = entityReducer(initial, new EntityAddItemAction(testItem));
        expect(out).toEqual(desired);
      });
    });
    describe('EntityRemoveItemAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const initial: EntityState = defaultState('items', {
          allIds: ['test-id'],
          byId: {'test-id': testItem}
        });
        const out = entityReducer(initial, new EntityRemoveItemAction('test-id'));
        expect(out).toEqual(defaultState());
      });
      it('should do nothing if an entity is not found by the given id', () => {
        const initial: EntityState = defaultState('items', {
          allIds: ['test-id'],
          byId: {'test-id': fakeEntity()}
        });
        const out = entityReducer(initial, new EntityRemoveItemAction('invalid-id'));
        expect(out).toEqual(initial);
      });
    });
  });
});

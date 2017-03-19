import {EntityState, entityReducer, EntityCollection} from './entity.reducer';
import {EntityAddAction, EntityRemoveAction} from './entity.actions';
import {Entity} from './entity.model';

describe('Entity', () => {

  function fakeEntity(values?: Partial<Entity>): Entity {
    const baseEntity: Entity = {
      exp: 0,
      type: 'npc',
      eid: 'test-id',
      baseAttack: 0,
      baseDefense: 0,
      baseMagic: 0,
      baseSpeed: 0,
      attack: 0,
      defense: 0,
      magic: 0,
      speed: 0
    };
    return Object.assign(baseEntity, values || {});
  }

  function defaultState(collection: string, values?: Partial<EntityCollection<any>>): EntityState {
    return Object.assign({
      [collection]: Object.assign({
        byId: {},
        allIds: []
      }, values || {})
    });
  }

  fdescribe('Actions', () => {
    const defaultCollection: string = 'players';
    describe('EntityAddAction', () => {
      it('should add an entity to the collection', () => {
        const initial: EntityState = defaultState(defaultCollection);
        const entity = fakeEntity();
        const desired: EntityState = {
          players: {
            allIds: ['test-id'],
            byId: {'test-id': entity}
          }
        };
        const out = entityReducer(initial, new EntityAddAction(entity, defaultCollection));
        expect(out).toEqual(desired);
      });
    });
    describe('EntityRemoveAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const initial: EntityState = defaultState(defaultCollection, {
          allIds: ['test-id'],
          byId: {'test-id': fakeEntity()}
        });
        const out = entityReducer(initial, new EntityRemoveAction('test-id', defaultCollection));
        expect(out).toEqual(defaultState(defaultCollection));
      });
      it('should do nothing if an entity is not found by the given id', () => {
        const initial: EntityState = defaultState(defaultCollection, {
          allIds: ['test-id'],
          byId: {'test-id': fakeEntity()}
        });
        const out = entityReducer(initial, new EntityRemoveAction('invalid-id', defaultCollection));
        expect(out).toEqual(initial);
      });
    });
  });
});

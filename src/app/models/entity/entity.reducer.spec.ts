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
import {GameStateHealPartyAction} from '../game-state/game-state.actions';
import {CombatVictoryAction, CombatVictorySummary} from '../combat/combat.actions';

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

  function fakeEntity(values?: Partial<Entity>): Entity {
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
    return Object.assign({}, baseEntity, values || {});
  }

  function fakeItem(): Item {
    const testItem: Item = {
      eid: testId,
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
          byId: {[testId]: entity},
          allIds: [testId]
        });
        const out = entityReducer(initial, new EntityAddBeingAction(entity));
        expect(out).toEqual(desired);
      });
    });
    describe('EntityRemoveBeingAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const initial: EntityState = defaultState('beings', {
          byId: {[testId]: fakeEntity()},
          allIds: [testId],
        });
        const out = entityReducer(initial, new EntityRemoveBeingAction(testId));
        expect(out).toEqual(defaultState());
      });
      it('should do nothing if an entity is not found by the given id', () => {
        const initial: EntityState = defaultState('beings', {
          byId: {[testId]: fakeEntity()},
          allIds: [testId]
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
          byId: {[testId]: item},
          allIds: [testId],
        });
        const out = entityReducer(initial, new EntityAddItemAction(item));
        expect(out).toEqual(desired);
      });
    });
    describe('EntityRemoveItemAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const initial: EntityState = defaultState('items', {
          byId: {[testId]: fakeItem()},
          allIds: [testId],
        });
        const out = entityReducer(initial, new EntityRemoveItemAction(testId));
        expect(out).toEqual(defaultState());
      });
      it('should do nothing if an entity is not found by the given id', () => {
        const initial: EntityState = defaultState('items', {
          byId: {[testId]: fakeItem()},
          allIds: [testId],
        });
        const out = entityReducer(initial, new EntityRemoveItemAction('invalid-id'));
        expect(out).toEqual(initial);
      });
    });

    //
    // Entity specific mutations
    //

    describe('GameStateHealPartyAction', () => {
      it('should restore all entities in partyIds hp and mp to their maximum', () => {
        const initial: EntityState = defaultState('beings', {
          byId: {
            [testId]: fakeEntity({
              hp: 10, maxhp: 25,
              mp: 0, maxmp: 25
            })
          },
          allIds: [testId]
        });
        const expected: EntityState = defaultState('beings', {
          byId: {
            [testId]: fakeEntity({
              hp: 25, maxhp: 25,
              mp: 25, maxmp: 25
            })
          },
          allIds: [testId]
        });
        const actual = entityReducer(initial, new GameStateHealPartyAction({
          cost: 0,
          partyIds: [testId]
        }));
        expect(actual).toEqual(expected);
      });
    });


    describe('CombatVictoryAction', () => {
      function summaryData(values?: Partial<CombatVictorySummary>): CombatVictorySummary {
        return Object.assign({
          party: [],
          enemies: [],
          levels: [],
          items: [],
          gold: 0,
          exp: 0
        }, values || {});
      }

      it('should update state of party members coming out of combat', () => {
        const victoryMemberId: string = 'victoriousFlamingo';
        const victoryMemberBefore = fakeEntity({
          eid: victoryMemberId,
          hp: 10,
          attack: 8,
          level: 1
        });
        const victoryMemberAfter = fakeEntity({
          eid: victoryMemberId,
          hp: 4,
          attack: 10,
          level: 2
        });
        const initial: EntityState = defaultState('beings', {
          byId: {
            [victoryMemberId]: victoryMemberBefore
          },
          allIds: [victoryMemberId]
        });
        const expected: EntityState = defaultState('beings', {
          byId: {
            [victoryMemberId]: victoryMemberAfter
          },
          allIds: [victoryMemberId]
        });
        const actual = entityReducer(initial, new CombatVictoryAction(summaryData({
          party: [victoryMemberAfter]
        })));
        expect(actual.beings.byId[victoryMemberId]).toEqual(expected.beings.byId[victoryMemberId]);
      });
    });

  });
});

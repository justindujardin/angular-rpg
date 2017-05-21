import {entityReducer, entityStateFactory, EntityStateRecord} from './entity.reducer';
import {Entity} from './entity.model';
import {
  EntityAddBeingAction,
  EntityAddItemAction,
  EntityRemoveBeingAction,
  EntityRemoveItemAction
} from './entity.actions';
import {Item} from '../item';
import {addEntityToCollection, BaseEntity, EntityCollectionRecord} from '../base-entity';
import {
  GameStateEquipItemAction, GameStateHealPartyAction,
  GameStateUnequipItemAction
} from '../game-state/game-state.actions';
import {CombatVictoryAction, CombatVictorySummary} from '../combat/combat.actions';
import {entityFactory} from '../records';

describe('Entity', () => {

  const testId: string = 'testid1234';

  function defaultState(collection?: 'items' | 'beings', entities?: any[]): EntityStateRecord {
    let resultState: EntityStateRecord = entityStateFactory();
    if (collection && entities) {
      resultState = resultState.updateIn([collection], (c: EntityCollectionRecord) => {
        entities.forEach((e) => {
          c = addEntityToCollection(c, e, e.eid);
        });
        return c;
      });

    }
    return resultState;
  }

  function fakeItem(): Item {
    const testItem: Item = {
      type: 'item',
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
        const initial: EntityStateRecord = defaultState();
        const entity = entityFactory({eid: testId});
        const out = entityReducer(initial, new EntityAddBeingAction(entity));
        expect(out.beings.byId.has(entity.eid)).toBe(true);
        expect(out.beings.allIds.indexOf(entity.eid)).toBeGreaterThan(-1);
      });
    });
    describe('EntityRemoveBeingAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const entity = entityFactory({eid: testId});
        const initial: EntityStateRecord = defaultState('beings', [entity]);
        expect(initial.beings.byId.count()).toBe(1);
        expect(initial.beings.allIds.count()).toBe(1);

        const out = entityReducer(initial, new EntityRemoveBeingAction(testId));
        expect(out.beings.byId.count()).toBe(0);
        expect(out.beings.allIds.count()).toBe(0);
      });
      it('should throw if an entity is not found by the given id', () => {
        expect(() => {
          entityReducer(defaultState(), new EntityRemoveBeingAction('invalid-id'));
        }).toThrow();
      });
    });

    //
    // Items
    //
    describe('EntityAddItemAction', () => {
      it('should add an item to the collection', () => {
        const initial: EntityStateRecord = defaultState();
        const item: Item = fakeItem();
        const out = entityReducer(initial, new EntityAddItemAction(item));
        expect(out.items.byId.has(item.eid)).toBe(true);
        expect(out.items.allIds.indexOf(item.eid)).toBeGreaterThan(-1);
      });
    });
    describe('EntityRemoveItemAction', () => {
      it('should remove an entity from the collection if it exists', () => {
        const item: Item = fakeItem();
        const initial: EntityStateRecord = defaultState('items', [item]);
        const out = entityReducer(initial, new EntityRemoveItemAction(testId));
        expect(out.items.byId.has(item.eid)).toBe(false);
        expect(out.items.allIds.indexOf(item.eid)).toBe(-1);
      });
      it('should throw if an entity is not found by the given id', () => {
        expect(() => {
          entityReducer(defaultState(), new EntityRemoveItemAction('invalid-id'));
        }).toThrow();
      });
    });

    //
    // Entity specific mutations
    //

    describe('GameStateEquipItemAction', () => {
      it('should throw if the entityId is invalid', () => {
        expect(() => {
          const item: Item = fakeItem();
          const state = entityReducer(defaultState(), new EntityAddItemAction(item)) as EntityStateRecord;
          entityReducer(state, new GameStateEquipItemAction({
            entityId: 'invalid',
            itemId: item.eid,
            slot: 'armor'
          }));
        }).toThrow();
      });
      it('should throw if the entity already has an item in the target slot', () => {
        expect(() => {
          const entity = entityFactory({
            armor: 'someCoolItem',
            eid: 'foo'
          });
          const state = entityReducer(defaultState(), new EntityAddBeingAction(entity)) as EntityStateRecord;
          entityReducer(state, new GameStateEquipItemAction({
            entityId: 'foo',
            itemId: 'invalid',
            slot: 'armor'
          }));
        }).toThrow();
      });
      it('should equip the item in the given slot for the target entity', () => {
        const entity = entityFactory({
          eid: 'foo'
        });
        const item = fakeItem();
        let state = entityReducer(defaultState(), new EntityAddItemAction(item)) as EntityStateRecord;
        state = entityReducer(state, new EntityAddBeingAction(entity)) as EntityStateRecord;
        state = entityReducer(state, new GameStateEquipItemAction({
          entityId: entity.eid,
          itemId: item.eid,
          slot: 'armor'
        })) as EntityStateRecord;
        expect(state.beings.byId.get(entity.eid).armor).toBe(item.eid);
      });
    });

    describe('GameStateUnequipItemAction', () => {
      it('should throw if the entityId is invalid', () => {
        expect(() => {
          const item: Item = fakeItem();
          const state = entityReducer(defaultState(), new EntityAddItemAction(item)) as EntityStateRecord;
          entityReducer(state, new GameStateUnequipItemAction({
            entityId: 'invalid',
            itemId: item.eid,
            slot: 'armor'
          }));
        }).toThrow();
      });
      it('should throw if the entity does not have the itemId already in the slot to remove from', () => {
        expect(() => {
          const entity = entityFactory({
            eid: 'foo'
          });
          const state = entityReducer(defaultState(), new EntityAddBeingAction(entity)) as EntityStateRecord;
          entityReducer(state, new GameStateUnequipItemAction({
            entityId: 'foo',
            itemId: 'invalid',
            slot: 'armor'
          }));
        }).toThrow();
      });
      it('should remove the item from the given slot for the target entity', () => {
        const item = fakeItem();
        const entity = entityFactory({
          armor: item.eid,
          eid: 'foo'
        });
        let state = entityReducer(defaultState(), new EntityAddItemAction(item)) as EntityStateRecord;
        state = entityReducer(state, new EntityAddBeingAction(entity)) as EntityStateRecord;
        state = entityReducer(state, new GameStateUnequipItemAction({
          entityId: entity.eid,
          itemId: item.eid,
          slot: 'armor'
        })) as EntityStateRecord;
        expect(state.beings.byId.get(entity.eid).armor).toBe(null);
      });
    });

    describe('GameStateHealPartyAction', () => {
      it('should restore all entities in partyIds hp and mp to their maximum', () => {
        const secondId: string = 'MotTon';
        const first = entityFactory({
          eid: testId,
          hp: 10, maxhp: 25,
          mp: 0, maxmp: 25
        });
        const second = entityFactory({
          eid: secondId,
          hp: 4, maxhp: 20,
          mp: 0, maxmp: 25
        });
        const initial: EntityStateRecord = defaultState('beings', [first, second]);
        const actual = entityReducer(initial, new GameStateHealPartyAction({
          cost: 0,
          partyIds: [testId, secondId]
        }));
        const firstHealed: BaseEntity = actual.beings.byId.get(testId);
        expect(firstHealed.hp).toBe(firstHealed.maxhp);
        expect(firstHealed.mp).toBe(firstHealed.maxmp);

        const secondHealed: BaseEntity = actual.beings.byId.get(secondId);
        expect(secondHealed.hp).toBe(secondHealed.maxhp);
        expect(secondHealed.mp).toBe(secondHealed.maxmp);
      });
    });

    describe('CombatVictoryAction', () => {
      function summaryData(values?: Partial<CombatVictorySummary>): CombatVictorySummary {
        return Object.assign({
          type: 'fixed',
          id: 'fake-id',
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
        const victorySecondId: string = 'eVellish';
        const victoryMemberBefore = entityFactory({
          eid: victoryMemberId,
          hp: 10,
          attack: 8,
          level: 1
        });
        const victoryMemberAfter = entityFactory({
          eid: victoryMemberId,
          hp: 4,
          attack: 10,
          level: 2
        });
        const victorySecondBefore = entityFactory({
          eid: victorySecondId,
          hp: 10,
          attack: 8,
          level: 1
        });
        const victorySecondAfter = entityFactory({
          eid: victorySecondId,
          hp: 4,
          attack: 10,
          level: 2
        });
        const initial: EntityStateRecord = defaultState('beings', [victoryMemberBefore, victorySecondBefore]);
        const actual = entityReducer(initial, new CombatVictoryAction(summaryData({
          party: [victoryMemberAfter, victorySecondAfter]
        })));
        const entity: Entity = actual.beings.byId.get(victoryMemberId);
        expect(entity.hp).toBe(victoryMemberAfter.hp);
        expect(entity.attack).toBe(victoryMemberAfter.attack);
        expect(entity.level).toBe(victoryMemberAfter.level);

        const second: Entity = actual.beings.byId.get(victorySecondId);
        expect(second.hp).toBe(victorySecondAfter.hp);
        expect(second.attack).toBe(victorySecondAfter.attack);
        expect(second.level).toBe(victorySecondAfter.level);
      });
    });

  });
});

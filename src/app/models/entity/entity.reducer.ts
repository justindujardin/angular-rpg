import {Entity} from './entity.model';
import {EntityActions, EntityActionTypes} from './entity.actions';
import {
  addEntityToCollection,
  BaseEntity,
  EntityCollection, entityCollectionFromJSON,
  EntityCollectionRecord,
  mergeEntityInCollection,
  removeEntityFromCollection
} from '../base-entity';
import {GameStateActions, GameStateActionTypes, GameStateHealPartyAction} from '../game-state/game-state.actions';
import {CombatActionTypes, CombatVictoryAction} from '../combat/combat.actions';
import {assertTrue} from '../util';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {Item} from '../item';
import * as Immutable from 'immutable';

// Beings
//
/** @internal */
export interface EntityBeingsRecord extends TypedRecord<EntityBeingsRecord>, EntityCollection<Entity> {
}
/** @internal */
const entityBeingsCollectionFactory =
  makeTypedFactory<EntityCollection<Entity>, EntityBeingsRecord>({
    byId: Immutable.Map<string, Entity>(),
    allIds: Immutable.List<string>()
  });

// Items
//
/** @internal */
export interface EntityItemsRecord extends TypedRecord<EntityItemsRecord>, EntityCollection<Item> {
}
/** @internal */
const entityItemsCollectionFactory =
  makeTypedFactory<EntityCollection<Item>, EntityItemsRecord>({
    byId: Immutable.Map<string, Item>(),
    allIds: Immutable.List<string>()
  });

/** Collection of Entity objects */
export interface EntityState {
  readonly beings: EntityCollection<Entity>;
  readonly items: EntityCollection<Item>;
  // TODO: features: EntityCollection<Feature>; <-- control treasure chests, fixed encounters on maps visibility etc.
  // TODO: quests: EntityCollection<Quest>; <-- OR express everything as a quest, and just start some of them silently
}
/**
 * Entity collections state record. Stores named entity collection records.
 * @private
 * @internal
 */
export interface EntityStateRecord extends TypedRecord<EntityStateRecord>, EntityState {
}

/**
 * @internal
 */
export const entityStateFactory = makeTypedFactory<EntityState, EntityStateRecord>({
  beings: entityBeingsCollectionFactory(),
  items: entityItemsCollectionFactory()
});

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function entityFromJSON(object: EntityState): EntityState {
  const recordValues = {
    beings: entityBeingsCollectionFactory(entityCollectionFromJSON(object.beings)),
    items: entityItemsCollectionFactory(entityCollectionFromJSON(object.items))
  };
  return entityStateFactory(recordValues);
}

type EntityReducerTypes = EntityActions | GameStateActions;

export function entityReducer(state: EntityStateRecord = entityStateFactory(),
                              action: EntityReducerTypes): EntityState {
  switch (action.type) {
    case EntityActionTypes.ADD_BEING: {
      const entity: BaseEntity = action.payload as BaseEntity;
      return state.updateIn(['beings'], (items) => addEntityToCollection(items, entity, entity.eid));
    }
    case EntityActionTypes.REMOVE_BEING: {
      const entityId: string = action.payload;
      return state.updateIn(['beings'], (items) => removeEntityFromCollection(items, entityId));
    }
    case EntityActionTypes.ADD_ITEM: {
      const entity: BaseEntity = action.payload as BaseEntity;
      return state.updateIn(['items'], (items) => addEntityToCollection(items, entity, entity.eid));
    }
    case EntityActionTypes.REMOVE_ITEM: {
      const entityId: string = action.payload;
      return state.updateIn(['items'], (items) => removeEntityFromCollection(items, entityId));
    }
    case GameStateActionTypes.HEAL_PARTY: {
      let result: EntityStateRecord = state;
      const partyAction = action as GameStateHealPartyAction;
      return result.updateIn(['beings'], (beings: EntityCollectionRecord) => {
        let updateBeingsResult = beings;
        partyAction.payload.partyIds.forEach((partyMemberId: string) => {
          const newHp = state.beings.byId.getIn([partyMemberId, 'maxhp']);
          const newMp = state.beings.byId.getIn([partyMemberId, 'maxmp']);
          updateBeingsResult = mergeEntityInCollection(beings, {
            hp: newHp,
            mp: newMp
          }, partyMemberId);
        });
        return updateBeingsResult;
      });
    }
    case CombatActionTypes.VICTORY: {
      let result: EntityStateRecord = state;
      const victoryAction = action as CombatVictoryAction;
      return result.updateIn(['beings'], (beings: EntityCollectionRecord) => {
        let updateBeingsResult = beings;
        victoryAction.payload.party.forEach((partyEntity: Entity) => {
          assertTrue(!!(partyEntity && partyEntity.eid), 'invalid party entity in combat victory action');
          updateBeingsResult = mergeEntityInCollection(beings, partyEntity, partyEntity.eid);
        });
        return updateBeingsResult;
      });
    }
    default:
      return state;
  }
}

/** @internal {@see sliceEntitiesState} */
export const sliceEntityBeingIds = (state: EntityState) => state.beings.allIds;
/** @internal {@see sliceEntitiesState} */
export const sliceEntityBeings = (state: EntityState) => state.beings.byId;
/** @internal {@see sliceEntitiesState} */
export const sliceEntityItemIds = (state: EntityState) => state.items.allIds;
/** @internal {@see sliceEntitiesState} */
export const sliceEntityItems = (state: EntityState) => state.items.byId;

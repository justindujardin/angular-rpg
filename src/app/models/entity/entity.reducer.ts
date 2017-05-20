import {Entity} from './entity.model';
import {
  EntityActions,
  EntityAddBeingAction,
  EntityAddItemAction,
  EntityRemoveBeingAction,
  EntityRemoveItemAction
} from './entity.actions';
import {
  addEntityToCollection,
  BaseEntity,
  EntityCollection,
  entityCollectionFromJSON,
  EntityCollectionRecord,
  mergeEntityInCollection,
  removeEntityFromCollection
} from '../base-entity';
import {
  GameStateEquipItemAction,
  GameStateHealPartyAction,
  GameStateUnequipItemAction
} from '../game-state/game-state.actions';
import {CombatVictoryAction} from '../combat/combat.actions';
import {assertTrue, exhaustiveCheck, makeRecordFactory} from '../util';
import {TypedRecord} from 'typed-immutable-record';
import {Item} from '../item';
import * as Immutable from 'immutable';
import {EntityRecord} from '../records';
import {ITemplateArmor, ITemplateItem, ITemplateWeapon} from '../game-data/game-data.model';

// Beings
//
/** @internal */
export interface EntityBeingsRecord extends TypedRecord<EntityBeingsRecord>, EntityCollection<Entity> {
}
/** @internal */
const entityBeingsCollectionFactory =
  makeRecordFactory<EntityCollection<Entity>, EntityBeingsRecord>({
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
  makeRecordFactory<EntityCollection<Item>, EntityItemsRecord>({
    byId: Immutable.Map<string, Item>(),
    allIds: Immutable.List<string>()
  });

/** Union type for entity items that may exist in the collection */
export type EntityItemTypes
  = Item
  | ITemplateWeapon
  | ITemplateArmor
  | ITemplateItem;

/** Collection of Entity objects */
export interface EntityState {
  readonly beings: EntityCollection<Entity>;
  readonly items: EntityCollection<EntityItemTypes>;
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
export const entityStateFactory = makeRecordFactory<EntityState, EntityStateRecord>({
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

type EntityReducerTypes = EntityActions
  | GameStateEquipItemAction
  | GameStateUnequipItemAction
  | GameStateHealPartyAction
  | CombatVictoryAction;

export function entityReducer(state: EntityStateRecord = entityStateFactory(),
                              action: EntityReducerTypes): EntityState {
  switch (action.type) {
    case EntityAddBeingAction.typeId: {
      const entity: BaseEntity = action.payload;
      return state.updateIn(['beings'], (items) => addEntityToCollection(items, entity, entity.eid));
    }
    case EntityRemoveBeingAction.typeId: {
      const entityId: string = action.payload;
      return state.updateIn(['beings'], (items) => removeEntityFromCollection(items, entityId));
    }
    case EntityAddItemAction.typeId: {
      const entity: Item = action.payload;
      return state.updateIn(['items'], (items) => addEntityToCollection(items, entity, entity.eid));
    }
    case EntityRemoveItemAction.typeId: {
      const entityId: string = action.payload;
      return state.updateIn(['items'], (items) => removeEntityFromCollection(items, entityId));
    }
    case GameStateHealPartyAction.typeId: {
      let result: EntityStateRecord = state;
      const partyAction: GameStateHealPartyAction = action;
      return result.updateIn(['beings'], (beings: EntityCollectionRecord) => {
        let updateBeingsResult = beings;
        partyAction.payload.partyIds.forEach((partyMemberId: string) => {
          const newHp = state.beings.byId.get(partyMemberId).maxhp;
          const newMp = state.beings.byId.get(partyMemberId).maxmp;
          updateBeingsResult = mergeEntityInCollection(updateBeingsResult, {
            hp: newHp,
            mp: newMp
          }, partyMemberId);
        });
        return updateBeingsResult;
      });
    }
    case GameStateEquipItemAction.typeId: {
      let result: EntityStateRecord = state;
      const current: Entity = state.beings.byId.get(action.payload.entityId);
      assertTrue(!!current, 'entity does not exist');
      assertTrue(!current[action.payload.slot],
        `entity already has item ${current[action.payload.slot]} in ${action.payload.slot}`);
      return result.updateIn(['beings', 'byId', action.payload.entityId], (entity: EntityRecord) => {
        return {
          ...entity,
          [action.payload.slot]: action.payload.itemId
        };
      });
    }
    case GameStateUnequipItemAction.typeId: {
      let result: EntityStateRecord = state;
      const current: Entity = state.beings.byId.get(action.payload.entityId);
      assertTrue(!!current, 'entity does not exist');
      assertTrue(current[action.payload.slot] === action.payload.itemId,
        `entity does not have item ${current[action.payload.slot]} equipped ${action.payload.slot}`);
      return result.updateIn(['beings', 'byId', action.payload.entityId], (entity: EntityRecord) => {
        return {
          ...entity,
          [action.payload.slot]: null
        };
      });
    }
    case CombatVictoryAction.typeId: {
      let result: EntityStateRecord = state;
      const victoryAction: CombatVictoryAction = action;
      return result.updateIn(['beings'], (beings: EntityCollectionRecord) => {
        let updateBeingsResult = beings;
        victoryAction.payload.party.forEach((partyEntity: Entity) => {
          assertTrue(!!(partyEntity && partyEntity.eid), 'invalid party entity in combat victory action');
          updateBeingsResult = mergeEntityInCollection(updateBeingsResult, partyEntity, partyEntity.eid);
        });
        return updateBeingsResult;
      });
    }
    default:
      exhaustiveCheck(action);
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

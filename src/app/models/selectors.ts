import { createSelector, Selector } from '@ngrx/store';
import * as Immutable from 'immutable';
import { AppState } from '../app.model';
import { IEntityObject, IPartyMember } from './base-entity';
import {
  sliceCombatEncounterEnemies,
  sliceCombatEncounterParty,
  sliceCombatLoading,
} from './combat/combat.reducer';
import { Entity, EntityWithEquipment } from './entity/entity.model';
import {
  EntityItemTypes,
  sliceEntityBeingIds,
  sliceEntityBeings,
  sliceEntityItemIds,
  sliceEntityItems,
} from './entity/entity.reducer';
import { ITemplateArmor, ITemplateWeapon } from './game-data/game-data.model';
import {
  sliceBattleCounter,
  sliceBoardedShip,
  sliceCombatZone,
  sliceGameStateKeyData,
  sliceGold,
  sliceInventoryIds,
  sliceMap,
  slicePartyIds,
  slicePosition,
  sliceShipPosition,
} from './game-state/game-state.reducer';
import { Item } from './item';
import { sliceSpritesById, sliceSpritesLoaded } from './sprites/sprites.reducer';
import { assertTrue } from './util';

/**
 * This file contains the application level data selectors that can be used with @ngrx/store to
 * select chunks of data from the store. There are two types of functions exported from this
 * file:
 *
 *  1. "slice" functions take in a state and return some subset of state from it.
 *  2. "get" functions are slice functions that have been composed together using {@see createSelector}
 *
 * It is preferred to use the "get" functions rather than using the "slice" functions directly. This
 * is because @ngrx/store will memoize calls to the combined selectors, which improves performance.
 *
 * @fileOverview
 */

//
// Combat
//

/**
 * Slice off the "combat" branch of the main application state.
 */
export const sliceCombatState = (state) => state.combat;

export const getCombatLoading = createSelector(sliceCombatState, sliceCombatLoading);
export const getCombatEncounterParty = createSelector(
  sliceCombatState,
  sliceCombatEncounterParty
);
export const getCombatEncounterEnemies = createSelector(
  sliceCombatState,
  sliceCombatEncounterEnemies
);

//
// Sprites
//

/**
 * Slice off the "sprites" branch of the main application state.
 */
export const sliceSpritesState = (state) => state.sprites;

export const getSpritesLoaded = createSelector(sliceSpritesState, sliceSpritesLoaded);
export const getSpriteMap = createSelector(sliceSpritesState, sliceSpritesById);

//
// Entity collections
//

/**
 * Slice off the "entities" branch of the main application state.
 */
export const sliceEntitiesState = (state) => state.entities;

/**
 * Given an entity "byIds" object, and its "allIds" array, return an array of the items
 * represented in the byIds dictionary. It's often easier to deal with array of items
 * than objects.
 */
export const entitiesToArray = (
  object: Immutable.Map<string, IEntityObject>,
  ids: Immutable.List<string>
) => {
  return ids.map((id: string) => object[id]).toArray();
};

// Beings
export const getEntityBeingById = createSelector(sliceEntitiesState, sliceEntityBeings);
export const getEntityBeingIds = createSelector(
  sliceEntitiesState,
  sliceEntityBeingIds
);

/** Select just one entity by its ID */
export const getEntityById = (id: string) => {
  return createSelector(
    getEntityBeingById,
    (entities: Immutable.Map<string, Entity>) => {
      return entities.get(id);
    }
  );
};

// Items
export const getEntityItemById = createSelector(sliceEntitiesState, sliceEntityItems);
export const getEntityItemIds = createSelector(sliceEntitiesState, sliceEntityItemIds);

/** Resolve equipment slots to their item entity objects for representation in the UI */
export const getEntityEquipment = (
  entityId: string
): Selector<AppState, EntityWithEquipment | null> => {
  return createSelector(getEntityById(entityId), getEntityItemById, (entity, items) => {
    if (!entity) {
      return null;
    }
    const result: Partial<EntityWithEquipment> = {
      armor: items.get(entity.armor) as ITemplateArmor,
      helm: items.get(entity.helm) as ITemplateArmor,
      shield: items.get(entity.shield) as ITemplateArmor,
      accessory: items.get(entity.accessory) as ITemplateArmor,
      boots: items.get(entity.boots) as ITemplateArmor,
      weapon: items.get(entity.weapon) as ITemplateWeapon,
    };
    return Object.assign({}, entity, result) as EntityWithEquipment;
  });
};

/** Resolve equipment slots to their item entity objects for representation in the UI */
export const getCombatEntityEquipment = (
  entityId: string
): Selector<AppState, EntityWithEquipment | null> => {
  return createSelector(getCombatEncounterParty, getEntityItemById, (party, items) => {
    const entity: Entity = party.find((p: IPartyMember) => p.eid === entityId);
    if (!entity) {
      return null;
    }
    const result: Partial<EntityWithEquipment> = {
      armor: items.get(entity.armor) as ITemplateArmor,
      helm: items.get(entity.helm) as ITemplateArmor,
      shield: items.get(entity.shield) as ITemplateArmor,
      accessory: items.get(entity.accessory) as ITemplateArmor,
      boots: items.get(entity.boots) as ITemplateArmor,
      weapon: items.get(entity.weapon) as ITemplateWeapon,
    };
    return Object.assign({}, entity, result) as EntityWithEquipment;
  });
};

//
// Game application state
//

/**
 * Slice off the "gameState" branch of the main application state.
 */
export const sliceGameState = (state) => state.gameState;

export const getGameInventoryIds = createSelector(sliceGameState, sliceInventoryIds);
export const getGamePartyIds = createSelector(sliceGameState, slicePartyIds);
export const getGamePartyGold = createSelector(sliceGameState, sliceGold);
export const getGamePartyPosition = createSelector(sliceGameState, slicePosition);
export const getGameShipPosition = createSelector(sliceGameState, sliceShipPosition);
export const getGameBoardedShip = createSelector(sliceGameState, sliceBoardedShip);
export const getGameMap = createSelector(sliceGameState, sliceMap);
export const getGameCombatZone = createSelector(sliceGameState, sliceCombatZone);
export const getGameBattleCounter = createSelector(sliceGameState, sliceBattleCounter);
export const getGameKeyData = createSelector(sliceGameState, sliceGameStateKeyData);
export const getGameParty = createSelector(
  getEntityBeingById,
  getGamePartyIds,
  (entities, ids): Immutable.List<Entity> => {
    return ids.map((id) => entities.get(id)).toList();
  }
);
/** Select just one data key from the gamesate keyData object. */
export const getGameKey = (key: string) => {
  return createSelector(getGameKeyData, (data: Immutable.Map<string, any>) => {
    return data.get(key);
  });
};

export const getGameInventory = createSelector(
  getEntityItemById,
  getGameInventoryIds,
  (
    entities: Immutable.Map<string, EntityItemTypes>,
    ids: Immutable.List<string>
  ): Immutable.List<Item> => {
    return ids
      .map((id) => {
        const result = entities.get(id);
        // Ensure that any item in the inventory has a corresponding entity. If not, throw a loud error
        // instead of crashing hard in an obscure place.
        assertTrue(
          result,
          `${id} is present in inventory but not in entity collection. Did you forget to dispatch EntityAddItemAction?`
        );
        return result as Item;
      })
      .toList();
  }
);

/** Get game Party with equipment objects resolved */
export const getGamePartyWithEquipment = createSelector(
  getGameParty,
  getEntityItemById,
  (party: Immutable.List<Entity>, items: Immutable.Map<string, EntityItemTypes>) => {
    return party
      .map((entity) => {
        if (!entity) {
          return null;
        }
        const result: Partial<EntityWithEquipment> = {
          armor: items.get(entity.armor) as ITemplateArmor,
          helm: items.get(entity.helm) as ITemplateArmor,
          shield: items.get(entity.shield) as ITemplateArmor,
          accessory: items.get(entity.accessory) as ITemplateArmor,
          boots: items.get(entity.boots) as ITemplateArmor,
          weapon: items.get(entity.weapon) as ITemplateWeapon,
        };
        return Object.assign({}, entity, result) as EntityWithEquipment;
      })
      .filter((r) => r !== null)
      .toList();
  }
);

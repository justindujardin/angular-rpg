import {createSelector} from 'reselect';
import {
  sliceEntityBeings, sliceEntityBeingIds, sliceEntityItems, sliceEntityItemIds,
  EntityItemTypes
} from './entity/entity.reducer';
import {
  sliceBattleCounter,
  sliceCombatZone,
  sliceMap,
  sliceShipPosition,
  slicePosition,
  sliceGold,
  slicePartyIds, sliceInventoryIds, sliceGameStateKeyData, sliceBoardedShip
} from './game-state/game-state.reducer';
import {
  sliceWeaponIds,
  sliceWeapons,
  sliceArmors,
  sliceArmorIds,
  sliceMagics,
  sliceMagicIds,
  sliceClasses,
  sliceClassesIds,
  sliceRandomEncounters,
  sliceRandomEncounterIds,
  sliceFixedEncounters,
  sliceFixedEncounterIds,
  sliceItems,
  sliceItemIds,
  sliceGameDataType, sliceEnemies, sliceEnemiesIds, sliceGameDataLoaded
} from './game-data/game-data.reducer';
import {
  sliceCombatEncounterEnemies, sliceCombatEncounterParty,
  sliceCombatLoading
} from './combat/combat.reducer';
import {BaseEntity} from './base-entity';
import * as Immutable from 'immutable';
import {ITemplateArmor, ITemplateId, ITemplateWeapon} from './game-data/game-data.model';
import {Entity, EntityWithEquipment} from './entity/entity.model';
import {AppState} from '../app.model';
import {Selector} from 'reselect/lib/reselect';
import {sliceSpritesLoaded, sliceSpritesById} from './sprites/sprites.reducer';
import {assertTrue} from './util';

/**
 * This file contains the application level data selectors that can be used with @ngrx/store to
 * select chunks of data from the store. There are two types of functions exported from this
 * file:
 *
 *  1. "slice" functions take in a state and return some subset of state from it.
 *  2. "get" functions are slice functions that have been composed together using {@see createSelector}
 *
 * It is preferred to use the "get" functions rather than using the "slice" functions directly. This
 * is because reselect will memoize calls to the combined selectors, which improves performance.
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
export const getCombatEncounterParty = createSelector(sliceCombatState, sliceCombatEncounterParty);
export const getCombatEncounterEnemies = createSelector(sliceCombatState, sliceCombatEncounterEnemies);

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
export const entitiesToArray = (object: Immutable.Map<string, BaseEntity>, ids: Immutable.List<string>) => {
  return ids.map((id: string) => object[id]).toArray();
};

// Beings
export const getEntityBeingById = createSelector(sliceEntitiesState, sliceEntityBeings);
export const getEntityBeingIds = createSelector(sliceEntitiesState, sliceEntityBeingIds);

/** Select just one entity by its ID */
export const getEntityById = (id: string) => {
  return createSelector(getEntityBeingById, (entities: Immutable.Map<string, Entity>) => {
    return entities.get(id);
  });
};

// Items
export const getEntityItemById = createSelector(sliceEntitiesState, sliceEntityItems);
export const getEntityItemIds = createSelector(sliceEntitiesState, sliceEntityItemIds);

/** Resolve equipment slots to their item entity objects for representation in the UI */
export const getEntityEquipment = (entityId: string): Selector<AppState, EntityWithEquipment | null> => {
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
export const getGameParty = createSelector(getEntityBeingById, getGamePartyIds, (entities, ids) => {
  return ids.map((id) => entities.get(id));
});
/** Select just one data key from the gamesate keyData object. */
export const getGameKey = (key: string) => {
  return createSelector(getGameKeyData, (data: Immutable.Map<string, any>) => {
    return data.get(key);
  });
};

export const getGameInventory = createSelector(
  getEntityItemById,
  getGameInventoryIds,
  (entities: Immutable.Map<string, EntityItemTypes>, ids: Immutable.List<string>) => {
    return ids.map((id) => {
      const result = entities.get(id);
      // Ensure that any item in the inventory has a corresponding entity. If not, throw a loud error
      // instead of crashing hard in an obscure place.
      assertTrue(result,
        `${id} is present in inventory but not in entity collection. Did you forget to dispatch EntityAddItemAction?`);
      return result;
    });
  });

//
// Game data
//

/**
 * Slice off the "gameData" branch of the main application state. This branch contains game data
 * such as available weapons, armor, items, fixed encounters, etc.
 */
export const sliceGameDataState = (state) => state.gameData;

/**
 * Boolean indicating if the gamedata tree is loaded.
 */
export const getGameDataLoaded = createSelector(sliceGameDataState, sliceGameDataLoaded);
/**
 * Given a template entity collection "byIds" object, and its "allIds" array, return an array of the items
 * represented in the byIds dictionary. It's often easier to deal with array of items than objects.
 */
export const gameDataToArray = (object: Immutable.Map<string, ITemplateId>, ids: Immutable.List<string>) => {
  return ids.map((id: string) => object.get(id));
};

export const getGameDataForType = (type: string) => {
  return createSelector(sliceGameDataState, sliceGameDataType(type));
};

export const getGameDataWeaponsById = createSelector(sliceGameDataState, sliceWeapons);
export const getGameDataWeaponIds = createSelector(sliceGameDataState, sliceWeaponIds);
/** Select an array of weapons */
export const getGameDataWeapons = createSelector(getGameDataWeaponsById, getGameDataWeaponIds, gameDataToArray);

export const getGameDataArmorsById = createSelector(sliceGameDataState, sliceArmors);
export const getGameDataArmorIds = createSelector(sliceGameDataState, sliceArmorIds);
/** Select an array of armors */
export const getGameDataArmors = createSelector(getGameDataArmorsById, getGameDataArmorIds, gameDataToArray);

export const getGameDataItemsById = createSelector(sliceGameDataState, sliceItems);
export const getGameDataItemIds = createSelector(sliceGameDataState, sliceItemIds);
/** Select an array of items */
export const getGameDataItems = createSelector(getGameDataItemsById, getGameDataItemIds, gameDataToArray);

export const getGameDataEnemiesById = createSelector(sliceGameDataState, sliceEnemies);
export const getGameDataEnemiesIds = createSelector(sliceGameDataState, sliceEnemiesIds);
/** Select an array of items */
export const getGameDataEnemies = createSelector(getGameDataEnemiesById, getGameDataEnemiesIds, gameDataToArray);

export const getGameDataMagicsById = createSelector(sliceGameDataState, sliceMagics);
export const getGameDataMagicIds = createSelector(sliceGameDataState, sliceMagicIds);
/** Select an array of magics */
export const getGameDataMagics = createSelector(getGameDataMagicsById, getGameDataMagicIds, gameDataToArray);

export const getGameDataClassesById = createSelector(sliceGameDataState, sliceClasses);
export const getGameDataClassesIds = createSelector(sliceGameDataState, sliceClassesIds);
/** Select an array of game character classes */
export const getGameDataClasses = createSelector(getGameDataClassesById, getGameDataClassesIds, gameDataToArray);

export const getGameDataRandomEncountersById = createSelector(sliceGameDataState, sliceRandomEncounters);
export const getGameDataRandomEncounterIds = createSelector(sliceGameDataState, sliceRandomEncounterIds);
/** Select an array of random combat encounters */
export const getGameDataRandomEncounters =
  createSelector(getGameDataRandomEncountersById, getGameDataRandomEncounterIds, gameDataToArray);

export const getGameDataFixedEncountersById = createSelector(sliceGameDataState, sliceFixedEncounters);
export const getGameDataFixedEncounterIds = createSelector(sliceGameDataState, sliceFixedEncounterIds);
/** Select an array of fixed combat encounters */
export const getGameDataFixedEncounters =
  createSelector(getGameDataFixedEncountersById, getGameDataFixedEncounterIds, gameDataToArray);

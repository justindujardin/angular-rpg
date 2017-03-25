import {createSelector} from 'reselect';
import {sliceBeings, sliceBeingIds, sliceItems, sliceItemIds} from './entity/entity.reducer';
import * as fromGameState from './game-state/game-state.reducer';

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
// Entity collections
//

/**
 * Slice off the "entities" branch of the main application state.
 */
export const sliceEntitiesState = (state) => state.entities;

// Beings
export const getEntityBeingById = createSelector(sliceEntitiesState, sliceBeings);
export const getEntityBeingIds = createSelector(sliceEntitiesState, sliceBeingIds);

// Items
export const getEntityItemById = createSelector(sliceEntitiesState, sliceItems);
export const getEntityItemIds = createSelector(sliceEntitiesState, sliceItemIds);

//
// Game application state
//

/**
 * Slice off the "gameState" branch of the main application state.
 */
export const sliceGameState = (state) => state.gameState;

export const getGamePartyIds = createSelector(sliceGameState, fromGameState.slicePartyIds);
export const getGamePartyGold = createSelector(sliceGameState, fromGameState.sliceGold);
export const getGamePartyPosition = createSelector(sliceGameState, fromGameState.slicePosition);
export const getGameShipPosition = createSelector(sliceGameState, fromGameState.sliceShipPosition);
export const getGameMap = createSelector(sliceGameState, fromGameState.sliceMap);
export const getGameCombatZone = createSelector(sliceGameState, fromGameState.sliceCombatZone);
export const getGameBattleCounter = createSelector(sliceGameState, fromGameState.sliceBattleCounter);

export const getParty = createSelector(getEntityBeingById, getGamePartyIds, (entities, ids) => {
  return ids.map((id) => entities[id]);
});

import * as Immutable from 'immutable';
import {EntityCollection, addEntityToCollection} from '../base-entity';
import {
  ITemplateWeapon,
  ITemplateArmor,
  ITemplateId,
  ITemplateItem,
  ITemplateRandomEncounter,
  ITemplateFixedEncounter,
  ITemplateClass,
  ITemplateMagic,
  ITemplateEnemy
} from './game-data.model';
import {GameDataActionClasses, GameDataActionTypes, IGameDataAddPayload} from './game-data.actions';

/** Collection of game data template objects */
export type GameDataState = {
  weapons: EntityCollection<ITemplateWeapon>;
  items: EntityCollection<ITemplateItem>;
  armor: EntityCollection<ITemplateArmor>;
  enemies: EntityCollection<ITemplateEnemy>;
  magic: EntityCollection<ITemplateMagic>;
  classes: EntityCollection<ITemplateClass>;
  fixedEncounters: EntityCollection<ITemplateFixedEncounter>;
  randomEncounters: EntityCollection<ITemplateRandomEncounter>;
};

const initialState: GameDataState = {
  weapons: {
    byId: {},
    allIds: []
  },
  items: {
    byId: {},
    allIds: []
  },
  armor: {
    byId: {},
    allIds: []
  },
  enemies: {
    byId: {},
    allIds: []
  },
  magic: {
    byId: {},
    allIds: []
  },
  classes: {
    byId: {},
    allIds: []
  },
  fixedEncounters: {
    byId: {},
    allIds: []
  },
  randomEncounters: {
    byId: {},
    allIds: []
  }
};

export function gameDataReducer(state: GameDataState = initialState, action: GameDataActionClasses): GameDataState {
  const removeId: string = action.payload as string;
  const addSheet: IGameDataAddPayload = action.payload as IGameDataAddPayload;
  switch (action.type) {
    case GameDataActionTypes.ADD_SHEET: {
      let collection: EntityCollection<ITemplateId> = state[addSheet.sheet];
      // Do not allow arbitrary sheet creation. Add known sheets to the state interface.
      if (!collection) {
        return state;
      }
      // TODO: This is pretty inefficient (does the immutable work for each item) Consider adding
      //       "addEntitiesToCollection" method that does (n) items at once.
      addSheet.data.forEach((data: ITemplateId) => {
        collection = addEntityToCollection<ITemplateId>(collection, data, data.id);
      });
      return Immutable.fromJS(state).merge({
        [addSheet.sheet]: collection
      }).toJS();
    }
    case GameDataActionTypes.REMOVE_SHEET: {
      let collection: EntityCollection<ITemplateId> = state[removeId];
      if (!collection) {
        return state;
      }
      const result = Immutable.fromJS(state).toJS();
      result[removeId] = {
        byId: {},
        allIds: []
      };
      return result;
    }
    default:
      return state;
  }
}

/** @internal {@see sliceGameDataState} */
export const sliceGameDataType = (type: string) => {
  return (state: GameDataState) => state[type].byId;
};
/** @internal {@see sliceGameDataState} */
export const sliceGameDataTypeIds = (type: string) => {
  return (state: GameDataState) => state[type].allIds;
};

/** @internal {@see sliceGameDataState} */
export const sliceWeaponIds = (state: GameDataState) => state.weapons.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceWeapons = (state: GameDataState) => state.weapons.byId;

/** @internal {@see sliceGameDataState} */
export const sliceArmorIds = (state: GameDataState) => state.armor.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceArmors = (state: GameDataState) => state.armor.byId;

/** @internal {@see sliceGameDataState} */
export const sliceItemIds = (state: GameDataState) => state.items.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceItems = (state: GameDataState) => state.items.byId;

/** @internal {@see sliceGameDataState} */
export const sliceEnemiesIds = (state: GameDataState) => state.enemies.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceEnemies = (state: GameDataState) => state.enemies.byId;

/** @internal {@see sliceGameDataState} */
export const sliceMagicIds = (state: GameDataState) => state.magic.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceMagics = (state: GameDataState) => state.magic.byId;

/** @internal {@see sliceGameDataState} */
export const sliceClassesIds = (state: GameDataState) => state.classes.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceClasses = (state: GameDataState) => state.classes.byId;

/** @internal {@see sliceGameDataState} */
export const sliceRandomEncounterIds = (state: GameDataState) => state.randomEncounters.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceRandomEncounters = (state: GameDataState) => state.randomEncounters.byId;

/** @internal {@see sliceGameDataState} */
export const sliceFixedEncounterIds = (state: GameDataState) => state.fixedEncounters.allIds;
/** @internal {@see sliceGameDataState} */
export const sliceFixedEncounters = (state: GameDataState) => state.fixedEncounters.byId;

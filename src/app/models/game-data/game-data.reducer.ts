import * as Immutable from 'immutable';
import {EntityCollection, addEntityToCollection} from '../being';
import {
  ITemplateWeapon,
  ITemplateArmor,
  ITemplateId,
  ITemplateItem,
  ITemplateRandomEncounter,
  ITemplateFixedEncounter,
  ITemplateClass,
  ITemplateMagic
} from './game-data.model';
import {GameDataActionClasses, GameDataActionTypes, IGameDataAddPayload} from './game-data.actions';

/** Collection of game data template objects */
export type GameDataState = {
  weapons: EntityCollection<ITemplateWeapon>;
  items: EntityCollection<ITemplateItem>;
  armor: EntityCollection<ITemplateArmor>;
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

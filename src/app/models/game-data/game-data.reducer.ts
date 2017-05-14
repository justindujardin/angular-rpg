import * as Immutable from 'immutable';
import {
  addEntityToCollection,
  EntityCollection,
  entityCollectionFromJSON,
  EntityCollectionRecord
} from '../base-entity';
import {
  ITemplateArmor,
  ITemplateClass,
  ITemplateEnemy,
  ITemplateFixedEncounter,
  ITemplateId,
  ITemplateBaseItem,
  ITemplateMagic,
  ITemplateRandomEncounter,
  ITemplateWeapon
} from './game-data.model';
import {
  GameDataActionClasses, GameDataAddSheetAction, GameDataRemoveSheetAction,
  IGameDataAddPayload
} from './game-data.actions';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {assertTrue, exhaustiveCheck} from '../util';

// Weapons
//
/** @internal */
export interface EntityWeaponsRecord extends TypedRecord<EntityWeaponsRecord>, EntityCollection<ITemplateWeapon> {
}
/** @internal */
const entityWeaponsCollectionFactory = makeTypedFactory<EntityCollection<ITemplateWeapon>, EntityWeaponsRecord>({
  byId: Immutable.Map<string, ITemplateWeapon>(),
  allIds: Immutable.List<string>()
});

// Items
//
/** @internal */
export interface EntityItemsRecord extends TypedRecord<EntityItemsRecord>, EntityCollection<ITemplateBaseItem> {
}
/** @internal */
const entityItemsCollectionFactory = makeTypedFactory<EntityCollection<ITemplateBaseItem>, EntityItemsRecord>({
  byId: Immutable.Map<string, ITemplateBaseItem>(),
  allIds: Immutable.List<string>()
});

// Armors
//
/** @internal */
export interface EntityArmorsRecord extends TypedRecord<EntityArmorsRecord>, EntityCollection<ITemplateArmor> {
}
/** @internal */
const entityArmorsCollectionFactory = makeTypedFactory<EntityCollection<ITemplateArmor>, EntityArmorsRecord>({
  byId: Immutable.Map<string, ITemplateArmor>(),
  allIds: Immutable.List<string>()
});

// Enemies
//
/** @internal */
export interface EntityEnemiesRecord extends TypedRecord<EntityEnemiesRecord>, EntityCollection<ITemplateEnemy> {
}
/** @internal */
const entityEnemiesCollectionFactory = makeTypedFactory<EntityCollection<ITemplateEnemy>, EntityEnemiesRecord>({
  byId: Immutable.Map<string, ITemplateEnemy>(),
  allIds: Immutable.List<string>()
});

// Magics
//
/** @internal */
export interface EntityMagicsRecord extends TypedRecord<EntityMagicsRecord>, EntityCollection<ITemplateMagic> {
}
/** @internal */
const entityMagicsCollectionFactory = makeTypedFactory<EntityCollection<ITemplateMagic>, EntityMagicsRecord>({
  byId: Immutable.Map<string, ITemplateMagic>(),
  allIds: Immutable.List<string>()
});

// Classes
//
/** @internal */
export interface EntityClassesRecord extends TypedRecord<EntityClassesRecord>, EntityCollection<ITemplateClass> {
}
/** @internal */
const entityClassesCollectionFactory = makeTypedFactory<EntityCollection<ITemplateClass>, EntityClassesRecord>({
  byId: Immutable.Map<string, ITemplateClass>(),
  allIds: Immutable.List<string>()
});

// Fixed Encounters
//
/** @internal */
export interface EntityFixedEncountersRecord extends TypedRecord<EntityFixedEncountersRecord>,
  EntityCollection<ITemplateFixedEncounter> {
}
/** @internal */
const entityFixedEncountersCollectionFactory =
  makeTypedFactory<EntityCollection<ITemplateFixedEncounter>, EntityFixedEncountersRecord>({
    byId: Immutable.Map<string, ITemplateFixedEncounter>(),
    allIds: Immutable.List<string>()
  });

// Random Encounters
//
/** @internal */
export interface EntityRandomEncountersRecord extends TypedRecord<EntityRandomEncountersRecord>,
  EntityCollection<ITemplateRandomEncounter> {
}
/** @internal */
const entityRandomEncountersCollectionFactory =
  makeTypedFactory<EntityCollection<ITemplateRandomEncounter>, EntityRandomEncountersRecord>({
    byId: Immutable.Map<string, ITemplateRandomEncounter>(),
    allIds: Immutable.List<string>()
  });

// Game Data state

/** @internal */
export interface GameDataStateRecord extends TypedRecord<GameDataStateRecord>, GameDataState {
}
/** @internal */
export const gameDataFactory = makeTypedFactory<GameDataState, GameDataStateRecord>({
  weapons: entityWeaponsCollectionFactory(),
  items: entityItemsCollectionFactory(),
  armor: entityArmorsCollectionFactory(),
  enemies: entityEnemiesCollectionFactory(),
  magic: entityMagicsCollectionFactory(),
  classes: entityClassesCollectionFactory(),
  fixedEncounters: entityFixedEncountersCollectionFactory(),
  randomEncounters: entityRandomEncountersCollectionFactory(),
});

/** Collection of game data template objects */
export interface GameDataState {
  weapons: EntityCollection<ITemplateWeapon>;
  items: EntityCollection<ITemplateBaseItem>;
  armor: EntityCollection<ITemplateArmor>;
  enemies: EntityCollection<ITemplateEnemy>;
  magic: EntityCollection<ITemplateMagic>;
  classes: EntityCollection<ITemplateClass>;
  fixedEncounters: EntityCollection<ITemplateFixedEncounter>;
  randomEncounters: EntityCollection<ITemplateRandomEncounter>;
}

/**
 * Convert input Plain JSON object into an Immutable.js representation with the correct records.
 * @param object The input values.
 */
export function gameDataFromJSON(object: GameDataState): GameDataState {
  const result = gameDataFactory({
    weapons: entityWeaponsCollectionFactory(entityCollectionFromJSON(object.weapons)),
    items: entityItemsCollectionFactory(entityCollectionFromJSON(object.items)),
    armor: entityArmorsCollectionFactory(entityCollectionFromJSON(object.armor)),
    enemies: entityEnemiesCollectionFactory(entityCollectionFromJSON(object.enemies)),
    magic: entityMagicsCollectionFactory(entityCollectionFromJSON(object.magic)),
    classes: entityClassesCollectionFactory(entityCollectionFromJSON(object.classes)),
    fixedEncounters: entityFixedEncountersCollectionFactory(entityCollectionFromJSON(object.fixedEncounters)),
    randomEncounters: entityRandomEncountersCollectionFactory(entityCollectionFromJSON(object.randomEncounters))
  });
  return result;
}

/**
 * Manage shared state for game-design data. Items for sale, monsters that exist in a fixed combat
 * encounter, base attributes for each class, etc.
 */
export function gameDataReducer(state: GameDataState = gameDataFactory(),
                                action: GameDataActionClasses): GameDataState {
  const stateRecord = state as GameDataStateRecord;
  switch (action.type) {
    case GameDataAddSheetAction.typeId: {
      const addSheet: IGameDataAddPayload = action.payload;
      assertTrue(!!state[addSheet.sheet], 'unknown collection cannot be added with sheet name: ' + addSheet.sheet);
      return stateRecord.updateIn([addSheet.sheet], (record: EntityCollectionRecord) => {
        addSheet.data.forEach((data: ITemplateId) => {
          record = addEntityToCollection(record, data, data.id);
        });
        return record;
      });
    }
    case GameDataRemoveSheetAction.typeId: {
      const removeId: string = action.payload;
      assertTrue(stateRecord.has(removeId), 'cannot remove sheet that does not exist: ' + removeId);
      return stateRecord.updateIn([removeId], (e: EntityCollectionRecord) => {
        return e
          .set('byId', e.byId.clear())
          .set('allIds', e.allIds.clear());
      });
    }
    default:
      exhaustiveCheck(action);
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

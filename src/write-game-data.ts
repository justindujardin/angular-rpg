import { ARMOR_DATA } from './app/models/game-data/armors';
import { FIXED_ENCOUNTERS_DATA } from './app/models/game-data/fixed-encounters';
import { ITEMS_DATA } from './app/models/game-data/items';
import { MAGIC_DATA } from './app/models/game-data/magic';
import { RANDOM_ENCOUNTERS_DATA } from './app/models/game-data/random-encounters';
import { WEAPONS_DATA } from './app/models/game-data/weapons';

/** Enum property type in tiled project file */
interface TiledEnumPropertyType {
  id?: number;
  name: string;
  type: 'enum';
  storageType: 'string';
  values: string[];
  valuesAsFlags: boolean;
}

interface TiledClassMemberPropertyType {
  name: string;
  propertyType: string;
  type: string;
  value: string;
}

/** Class property type in tiled project file */
interface TiledClassPropertyType {
  color?: string;
  id?: number;
  name: string;
  type: 'class';
  members: TiledClassMemberPropertyType[];
  useAs: string[];
}

/** Enumerate the used zone names from all random encounters that are defined */
function getZoneNames(): string[] {
  const allZones = {
    none: true,
  };
  RANDOM_ENCOUNTERS_DATA.forEach((enc) => {
    enc.zones.forEach((zone) => (allZones[zone] = true));
  });
  return Object.keys(allZones).sort();
}

type PropertyTypes = TiledEnumPropertyType | TiledClassPropertyType;

const data: PropertyTypes[] = [
  {
    name: 'DataRandomEncounters',
    storageType: 'string',
    type: 'enum',
    values: getZoneNames(),
    valuesAsFlags: false,
  },
  {
    name: 'DataFixedEncounters',
    storageType: 'string',
    type: 'enum',
    values: FIXED_ENCOUNTERS_DATA.map((enc) => enc.id),
    valuesAsFlags: false,
  },

  // Stores
  {
    name: 'DataWeapons',
    storageType: 'string',
    type: 'enum',
    values: WEAPONS_DATA.map((enc) => enc.id),
    valuesAsFlags: true,
  },
  {
    name: 'WeaponsStoreFeatureComponent',
    type: 'class',
    useAs: ['object', 'tile'],
    members: [
      {
        name: 'inventory',
        propertyType: 'DataWeapons',
        type: 'string',
        value: '',
      },
    ],
  },
  {
    name: 'DataArmors',
    storageType: 'string',
    type: 'enum',
    values: ARMOR_DATA.map((enc) => enc.id),
    valuesAsFlags: true,
  },
  {
    name: 'ArmorsStoreFeatureComponent',
    type: 'class',
    useAs: ['object', 'tile'],
    members: [
      {
        name: 'inventory',
        propertyType: 'DataArmors',
        type: 'string',
        value: '',
      },
    ],
  },
  {
    name: 'DataItems',
    storageType: 'string',
    type: 'enum',
    values: ITEMS_DATA.map((enc) => enc.id),
    valuesAsFlags: true,
  },
  {
    name: 'ItemsStoreFeatureComponent',
    type: 'class',
    useAs: ['object', 'tile'],
    members: [
      {
        name: 'inventory',
        propertyType: 'DataItems',
        type: 'string',
        value: '',
      },
    ],
  },
  {
    name: 'DataMagics',
    storageType: 'string',
    type: 'enum',
    values: MAGIC_DATA.map((enc) => enc.id),
    valuesAsFlags: true,
  },
  {
    name: 'MagicsStoreFeatureComponent',
    type: 'class',
    useAs: ['object', 'tile'],
    members: [
      {
        name: 'inventory',
        propertyType: 'DataMagics',
        type: 'string',
        value: '',
      },
    ],
  },
];

console.log(JSON.stringify(data, null, 2));

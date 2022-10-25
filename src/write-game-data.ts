import { FIXED_ENCOUNTERS_DATA } from './app/models/game-data/fixed-encounters';
import { RANDOM_ENCOUNTERS_DATA } from './app/models/game-data/random-encounters';

/** Enum property type in tiled project file */
interface TiledEnumPropertyType {
  id?: number;
  name: string;
  type: 'enum';
  storageType: 'string';
  values: string[];
  valuesAsFlags: boolean;
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

const DataRandomEncounters: TiledEnumPropertyType = {
  name: 'DataRandomEncounters',
  storageType: 'string',
  type: 'enum',
  values: getZoneNames(),
  valuesAsFlags: false,
};

const DataFixedEncounters: TiledEnumPropertyType = {
  name: 'DataFixedEncounters',
  storageType: 'string',
  type: 'enum',
  values: FIXED_ENCOUNTERS_DATA.map((enc) => enc.id),
  valuesAsFlags: false,
};

const data = [DataRandomEncounters, DataFixedEncounters];

console.log(JSON.stringify(data, null, 2));

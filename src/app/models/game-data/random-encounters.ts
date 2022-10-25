import { ITemplateRandomEncounter } from './game-data.model';

export const RANDOM_ENCOUNTERS_DATA: ITemplateRandomEncounter[] = [
  {
    id: 'world-plains-weak',
    zones: ['world-plains', 'zone-village'],
    enemies: ['imp', 'imp', 'imp', 'goblin-scout'],
  },
  {
    id: 'world-sand-pack',
    zones: ['world-sand', 'zone-crypt'],
    enemies: ['black-spider', 'black-spider', 'black-spider', 'black-spider'],
  },
  {
    id: 'world-plains-duo',
    zones: ['world-plains'],
    enemies: ['snake', 'imp', 'imp'],
  },
  { id: 'world-sewer', zones: ['zone-sewer'], enemies: ['snake', 'kobold', 'kobold'] },
  {
    id: 'world-sewer-2',
    zones: ['zone-sewer'],
    enemies: ['huge-spider', 'kobold', 'kobold'],
  },
  {
    id: 'world-ocean-1-1',
    zones: ['world-ocean-1'],
    enemies: ['kobold', 'kobold', 'kobold-shaman'],
  },
  {
    id: 'world-forest-single',
    zones: ['world-forest'],
    enemies: ['huge-spider', 'kobold', 'kobold'],
  },
  {
    id: 'world-fortress-archer',
    zones: ['zone-goblin-fortress'],
    enemies: ['goblin-archer', 'goblin-archer'],
  },
  {
    id: 'world-fortress-spear',
    zones: ['zone-goblin-fortress'],
    enemies: ['goblin-spear', 'goblin'],
  },
];

/** Get a random encounter descriptor given its id value */
export function getRandomEncounterById(id: string): ITemplateRandomEncounter | null {
  return RANDOM_ENCOUNTERS_DATA.find((item) => item.id === id);
}

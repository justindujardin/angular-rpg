import { ITemplateRandomEncounter } from '../game-data.model';

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
    zones: ['world-plains', 'zone-sewer'],
    enemies: ['snake', 'imp', 'imp'],
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

import { ITemplateFixedEncounter } from '../game-data.model';

export const FIXED_ENCOUNTERS_DATA: ITemplateFixedEncounter[] = [
  {
    id: 'sewer-kobolds',
    enemies: ['kobold', 'kobold', 'kobold'],
    experience: 50,
    gold: 25,
    items: [],
    message: [
      'You are confronted by three Kobolds.',
      'Real mean looking ones.',
      "They don't look very keen on the idea of giving up their stash.",
      'Nope.',
    ],
  },
  {
    id: 'sewer-kobolds-elite',
    enemies: ['kobold-shaman', 'kobold-fighter'],
    experience: 100,
    gold: 50,
    items: ['kobold-staff'],
    message: [
      'Surrounded by roiling sewage water, you see a make-shift Kobold throne room!',
      'A shamanistic Kobold points at you and howls!',
    ],
  },
  {
    id: 'world-plains-snakes',
    enemies: ['snake', 'snake', 'snake', 'snake'],
    experience: 25,
    gold: 25,
    items: ['potion'],
    message: ['A nest of vicious snakes block the path!'],
  },
  {
    id: 'fortress-guard',
    enemies: ['goblin-spear', 'goblin', 'goblin'],
    experience: 0,
    gold: 0,
    items: [],
    message: ['A pack of Goblins block your passage!'],
  },
  {
    id: 'goblin-archers',
    enemies: ['goblin-spear', 'goblin-archer', 'goblin-archer', 'goblin-archer'],
    experience: 0,
    gold: 0,
    items: [],
    message: ['A spearman and archers block your path!'],
  },
  {
    id: 'fortress-wizard',
    enemies: ['goblin-wizard'],
    experience: 0,
    gold: 0,
    items: [],
    message: [
      'A Goblin spiritual leader of some variety shouts curses as you approach!',
    ],
  },
];

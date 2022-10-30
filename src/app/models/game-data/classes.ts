import { ITemplateClass } from './game-data.model';

export const CLASSES_DATA: ITemplateClass[] = [
  {
    name: 'Warrior',
    id: 'warrior',
    icon: 'warrior-[gender].png',
    hp: 35,
    mp: 0,
    strength: [20],
    agility: [5],
    intelligence: [1],
    vitality: [25],
    luck: [5],
    hitpercent: [10, 3],
    magicdefense: [15, 3],
  },
  {
    name: 'Ranger',
    id: 'ranger',
    icon: 'ranger-[gender].png',
    hp: 30,
    mp: 0,
    strength: [3],
    agility: [10],
    intelligence: [5],
    vitality: [5],
    luck: [15],
    hitpercent: [22, 2],
    magicdefense: [15, 2],
  },
  {
    name: 'Mage',
    id: 'mage',
    icon: 'magician-[gender].png',
    hp: 25,
    mp: 20,
    strength: [1],
    agility: [10],
    intelligence: [20],
    vitality: [1],
    luck: [10],
    hitpercent: [5, 1],
    magicdefense: [20, 2],
  },
  {
    name: 'Healer',
    id: 'healer',
    icon: 'healer-[gender].png',
    hp: 28,
    mp: 20,
    strength: [5],
    agility: [5],
    intelligence: [15],
    vitality: [10],
    luck: [5],
    hitpercent: [5, 1],
    magicdefense: [20, 2],
  },
];

/** Get a class descriptor given its id value */
export function getClassById(id: string): ITemplateClass {
  const template = CLASSES_DATA.find((item) => item.id === id);
  if (!template) {
    throw new Error(`getClassById: invalid template id ${id}`);
  }
  return template;
}

import { ITemplateMagic } from './game-data.model';

export const MAGIC_DATA: ITemplateMagic[] = [
  {
    id: 'push',
    type: 'spell',
    name: 'Minor Wind Stone',
    level: 1,
    magicname: 'Forceful Gust',
    icon: 'blueGem.png',
    target: 'target',
    magiccost: 4,
    effect: 'elemental-damage',
    magnitude: 2,
    usedby: ['mage', 'healer'],
    groups: ['default'],
    elements: ['wind'],
    value: 100,
    benefit: false,
  },
  {
    id: 'heal',
    type: 'spell',
    name: 'Minor Life Stone',
    level: 2,
    magicname: 'Healing Bubbles',
    icon: 'turqoiseGem.png',
    target: 'target',
    magiccost: 12,
    effect: 'modify-hp',
    magnitude: 15,
    usedby: ['mage', 'healer'],
    groups: ['default'],
    elements: ['water'],
    value: 25,
    benefit: true,
  },
];

/** Get a magic descriptor given its id value */
export function getMagicById(id: string): ITemplateMagic {
  const template = MAGIC_DATA.find((item) => item.id === id);
  if (!template) {
    throw new Error(`getMagicById: invalid template id ${id}`);
  }
  return template;
}

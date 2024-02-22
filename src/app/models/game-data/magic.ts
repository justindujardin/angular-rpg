import { ITemplateMagic } from './game-data.model';

export const MAGIC_DATA: ITemplateMagic[] = [
  {
    id: 'push',
    type: 'spell',
    name: 'Wind (Push)',
    level: 1,
    magicname: 'Push',
    icon: 'blueGem.png',
    target: 'target',
    magiccost: 4,
    effect: 'elemental-damage',
    magnitude: 1,
    usedby: ['mage', 'healer'],
    groups: ['default'],
    elements: ['wind'],
    value: 100,
    benefit: false,
  },
  {
    id: 'heal',
    type: 'spell',
    name: 'Heal',
    level: 2,
    magicname: 'Heal',
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
export function getMagicById(id: string): ITemplateMagic | null {
  return MAGIC_DATA.find((item) => item.id === id) || null;
}

import { ITemplateItem } from '../game-data.model';

export const ITEMS_DATA: ITemplateItem[] = [
  {
    id: 'potion',
    type: 'item',
    name: 'Potion',
    level: 1,
    icon: 'redPotion.png',
    effects: ['heal(50)'],
    value: 50,
  },
  {
    id: 'ether',
    type: 'item',
    name: 'Ether',
    level: 10,
    icon: 'bluePotion2.png',
    effects: ['magic(100)'],
    value: 1500,
    usedby: null,
  },
];

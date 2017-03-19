import {EntityObject} from './being';
export interface Item extends EntityObject {
  readonly id?: string; // the `hyphen-case-named` item id
  readonly name: string; // The item name
  readonly cost: number; // The cost of this item
  readonly icon: string; // Sprite icon name, e.g. LongSword.png
  readonly usedby?: any[]; // `HeroType`s that can use this item.
}

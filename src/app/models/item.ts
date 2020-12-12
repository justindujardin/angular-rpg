import { IEntityObject } from './base-entity';
import { ITemplateItem } from './game-data/game-data.model';

export type ItemCategories = 'item' | 'weapon' | 'armor' | 'misc' | 'spell';

/**
 * An instance of a template item that has been created.
 */
export interface Item extends ITemplateItem, IEntityObject {
  /**
   * The category of the item. Useful for filtering by item type.
   */
  readonly category?: ItemCategories;
}

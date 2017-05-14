import {EntityObject} from './base-entity';
import {ItemCategories, ITemplateItem} from './game-data/game-data.model';

/**
 * An instance of a template item that has been created.
 */
export interface Item extends ITemplateItem, EntityObject {
  /**
   * The ID of the entity that this item is equipped by (if any)
   */
  readonly equippedBy?: string | undefined;

  /**
   * The category of the item. Useful for filtering by item type.
   */
  readonly category?: ItemCategories;
}

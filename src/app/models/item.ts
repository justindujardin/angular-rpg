import { IEntityObject } from './base-entity';
import { ITemplateBaseItem } from './game-data/game-data.model';

export type ItemCategories = 'item' | 'weapon' | 'armor' | 'misc' | 'spell';

/**
 * An instance of a template item that has been created.
 */
export interface Item extends ITemplateBaseItem, IEntityObject {}

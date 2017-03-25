import {EntityObject} from './being';
import {ITemplateItem} from './game-data/game-data.model';

/**
 * The item object directly from the spreadsheet.
 */
export interface Item extends ITemplateItem, EntityObject {
}

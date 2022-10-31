import { IEntityObject } from './base-entity';
import {
  ITemplateArmor,
  ITemplateBaseItem,
  ITemplateMagic,
  ITemplateWeapon,
} from './game-data/game-data.model';

export type ItemCategories = 'item' | 'weapon' | 'armor' | 'misc' | 'spell';

/**
 * An instance of a template item that has been created.
 */
export interface Item extends ITemplateBaseItem, IEntityObject {}
export interface Weapon extends ITemplateWeapon, IEntityObject {}
export interface Armor extends ITemplateArmor, IEntityObject {}
export interface Magic extends ITemplateMagic, IEntityObject {}

/**
 * The game data is defined in a shared Google Spreadsheet, to allow designers to easily tweak the
 * game without developer intervention. This file describes the data that is imported from the spreadsheet
 * grouped by "tab". If the spreadsheet format changes, this file must be updated.
 *
 * @fileOverview
 */
import {EntityType} from '../entity/entity.model';

export type ItemCategories = 'item' | 'weapon' | 'armor';

export type ItemGroups = 'default' | 'rare' | 'magic';

export type ItemElements = 'holy' | 'water' | 'wind' | 'heal';

export type ItemArmorType = 'body' | 'head' | 'feet' | 'arms';

/**
 * The Google Spreadsheet ID to load game data from.  This must be a published
 * google spreadsheet key.
 * @type {string} The google spreadsheet ID
 */
export const SPREADSHEET_ID: string = '1LXSRyupQanOYeZv-h7lgSwaAzB-TxwfDPFJyZqnaewc';

export interface ITemplateId {
  /**
   * The lowercase-hyphenated string id of the item. This can be used to look the id up in the table.
   */
  readonly id: string;
}

export interface ITemplateItem extends ITemplateId {
  /**
   * The sprite icon name to use to render the item, e.g. "shortSword.png", "bluePotion.png".
   * Note that the icon must exist in the game's sprites collection to be valid.
   */
  readonly icon: string;
  /**
   * The value of the object. This is used for buying/selling.
   */
  readonly value: number;
  /**
   * Human readable item name, e.g. "Short Sword"
   */
  readonly name: string;
  /**
   * The level of the weapon.
   */
  readonly level: number;
  /**
   * This object is only used by the given types of entities {@see EntityType}
   */
  readonly usedby?: EntityType[];
  /**
   * Any elements this item aligns with.
   */
  readonly elements?: ItemElements[];

  /**
   * Any logical groups of items this object matches, e.g. "rare", "magic"
   */
  readonly groups?: ItemGroups[];
}
export interface ITemplateWeapon extends ITemplateItem {
  /**
   * The attack value for this weapon.
   */
  attack: number;
}
export interface ITemplateArmor extends ITemplateItem {
  /**
   * What part of the body does the armor apply to?
   */
    type: ItemArmorType;

  /**
   * The defensive rating of this piece of armor.
   */
  defense: number;
}

export type MagicType = 'target' | 'all';

export interface ITemplateMagic extends ITemplateItem {
  readonly type: MagicType;

  /**
   * True if the magic benefits the target.
   */
  readonly benefit: boolean;

  /**
   * How much the magic benefits or harms the target.
   */
  readonly magnitude: number;
}

export interface ITemplateClass extends ITemplateId {
  /**
   * Human readable class name, e.g. "Warrior" or "Mage"
   */
  readonly name: string;

  /**
   * The template string for the icon to render this class type with. It contains a token that must
   * be replaced in order to be used. The format is "classname-[gender].png" where "[gender]" is replaced
   * with "female" or "male".
   */
  readonly icon: string;

  /**
   * Base attack value
   */
  readonly baseattack: number;
  /**
   * Base defense value
   */
  readonly basedefense: number;
  /**
   * Base magic value
   */
  readonly basemagic: number;
  /**
   * Base speed value
   */
  readonly basespeed: number;
}

export interface ITemplateEnemy extends ITemplateId {
  /** Current magic points */
  readonly mp: number;
  /** Current health points */
  readonly hp: number;
  /** Attack strength */
  readonly attack: number;
  /** Defense effectiveness */
  readonly defense: number;
  /** Magic strength */
  readonly magic: number;
  /** Agility/Dexterity */
  readonly speed: number;
}

//
// Combat
//

/**
 * A Combat encounter descriptor.  Used to describe the configuration of combat.
 */
export interface ITemplateEncounter extends ITemplateId {
  readonly id: string; // unique id in spreadsheet
  readonly enemies: string[]; // array of enemies in this encounter
  readonly message: string[]; // message to display when combat begins
}

/**
 * A Fixed combat encounter.
 *
 * Fixed encounters are ones that happen when you interact with some fixed part
 * of the game map.
 */
export interface ITemplateFixedEncounter extends ITemplateEncounter {
  readonly gold?: number;
  readonly experience?: number;
  readonly items?: string[];
}
/**
 * A Random combat encounter.
 *
 * Random encounters happen during movement about a map that has a `CombatEncounterComponent`
 * added to it.
 */
export interface ITemplateRandomEncounter extends ITemplateEncounter {
  /**
   * array of zones this encounter can happen in
   */
  readonly zones: string[];
}

/**
 * Callback when
 */
export interface IGameEncounterCallback {
  (victory: boolean): void;
}

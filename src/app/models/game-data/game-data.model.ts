import * as Immutable from 'immutable';
import { EntityType, IEnemy, IPartyMember } from '../base-entity';
import { newGuid } from '../util';

/**
 * The game data is defined in a shared Google Spreadsheet, to allow designers to easily tweak the
 * game without developer intervention. This file describes the data that is imported from the spreadsheet
 * grouped by "tab". If the spreadsheet format changes, this file must be updated.
 *
 * @fileOverview
 */

export type ItemGroups = 'default' | 'rare' | 'magic';

export type ItemElements = 'holy' | 'water' | 'wind' | 'heal';

export type ItemArmorType = 'armor' | 'helm' | 'boots' | 'shield' | 'accessory';

/**
 * The Google Spreadsheet ID to load game data from.  This must be a published
 * google spreadsheet key.
 */
export const SPREADSHEET_ID: string =
  'https://docs.google.com/spreadsheets/d/1JK3NthX0O0-8BvJFTSMhngaioDbpa7qJiOlWI2H2RQ0/edit?usp=sharing';

export interface ITemplateId {
  /**
   * The lowercase-hyphenated string id of the item. This can be used to look the id up in the table.
   */
  readonly id: string;
}

export interface ITemplateBaseItem extends ITemplateId {
  /** Each type specifies this */
  readonly type: any;

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

export interface ITemplateItem extends ITemplateBaseItem {
  readonly type: 'item';
}

export interface ITemplateWeapon extends ITemplateBaseItem {
  readonly type: 'weapon';
  /**
   * The attack value for this weapon.
   */
  attack: number;
  /**
   * The hit-percentage bonus the weapon imparts
   */
  hit: number;
}
export interface ITemplateArmor extends ITemplateBaseItem {
  /**
   * What part of the body does the armor apply to?
   */
  readonly type: ItemArmorType;

  /**
   * The defensive rating of this piece of armor.
   */
  readonly defense: number;

  /**
   * The weight of the item (heavier items decrease evasion more)
   */
  readonly weight: number;
}

export type MagicType = 'target' | 'all';

export interface ITemplateMagic extends ITemplateBaseItem {
  readonly type: 'spell';
  /** What type of target does this spell have? */
  readonly target: MagicType;
  /** What is the readable name for this spell? */
  readonly magicname: string;
  /** The base MP cost required to cast this */
  readonly magiccost: number;
  /** The id of the effect this spell applies */
  readonly effect: string;
  /** The magnitude of the effect */
  readonly magnitude: number;
  /** True if the magic benefits the target. */
  readonly benefit: boolean;
}

export interface ITemplateClass extends ITemplateId, IPartyMember {
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
}

export interface ITemplateEnemy extends ITemplateId, IEnemy {
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
  readonly enemies: Immutable.List<string>; // array of enemies in this encounter
  readonly message: Immutable.List<string>; // message to display when combat begins
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
 * Instantiate an item from its template and assign it a unique eid value.
 * @param from The ITemplateId to stamp out a copy of
 * @param values Any optional values to assign to the instance during creation
 */
export function instantiateEntity<T extends ITemplateId>(
  from: any,
  values?: Partial<T>
): T {
  return Object.assign(
    {
      eid: entityId(from.id),
      status: [],
    },
    from,
    values || {}
  ) as T;
}

/** Generate a UUID for a given input template ID that is unique across all instances of the same template base */
export function entityId(id: string): string {
  return `${id}-${newGuid()}`;
}

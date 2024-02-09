import { EntityType, IPartyBaseStats } from '../base-entity';
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

/** Array of valid equipment slot names on a party member */
export const EQUIPMENT_SLOTS = ['armor', 'helm', 'boots', 'shield', 'weapon'] as const;

/** Valid equipment slot strings type */
export type EquipmentSlotTypes = (typeof EQUIPMENT_SLOTS)[number];

export type ItemWeaponType = 'weapon';

export type ItemArmorType = 'armor' | 'helm' | 'boots' | 'shield' | 'accessory';

export interface ITemplateId {
  /**
   * The lowercase-hyphenated string id of the item. This can be used to look the id up in the table.
   */
  readonly id: string;
}

export interface ITemplateBaseItem extends ITemplateId {
  /** Each type specifies this */
  readonly type: string;

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
  /**
   * The effects to apply
   */
  readonly effects?: [string, number];
}

export interface ITemplateItem extends ITemplateBaseItem {
  readonly type: 'item';
}

export interface ITemplateWeapon extends ITemplateBaseItem {
  readonly type: ItemWeaponType;
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

export interface ITemplateClass extends ITemplateId, IPartyBaseStats {
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

export interface ITemplateEnemy extends ITemplateId {
  /**
   * Human readable class name, e.g. "Warrior" or "Mage"
   */
  readonly name: string;
  /** Enemy icon */
  readonly icon: string;
  /** Enemy level */
  readonly level: number;
  /** Current magic points */
  readonly mp: number;
  /** Current health points */
  readonly hp: number;
  /** Attack strength */
  readonly attack: number;
  /** Defense effectiveness */
  readonly defense: number;
  /** The amount of experience granted for defeating this enemy */
  readonly exp: number;
  /** The amount of gold granted for defeating this enemy */
  readonly gold: number;
  readonly hitpercent: number;
  // /** Magic strength */
  // readonly magic: number;
  // /** Agility/Dexterity */
  // readonly speed: number;
}

//
// Combat
//

/**
 * A Combat encounter descriptor.  Used to describe the configuration of combat.
 */
export interface ITemplateEncounter extends ITemplateId {
  /** Unique ID */
  readonly id: string;
  /** array of enemies in this encounter */
  readonly enemies: string[];
  /** message to display when combat begins */
  readonly message?: string[];
}

/**
 * A Fixed combat encounter.
 *
 * Fixed encounters are ones that happen when you interact with some fixed part
 * of the game map.
 */
export interface ITemplateFixedEncounter extends ITemplateEncounter {
  /** The amount of experience granted for defeating this encounter */
  readonly experience: number;
  /** The amount of gold granted for defeating this encounter */
  readonly gold: number;
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
  values?: Partial<T>,
): T {
  return Object.assign(
    {
      eid: entityId(from.id),
      status: [],
    },
    from,
    values || {},
  ) as T;
}

/** Generate a UUID for a given input template ID that is unique across all instances of the same template base */
export function entityId(id: string): string {
  return `${id}-${newGuid()}`;
}

import {Item} from '../item/item.model';
import {PartyMember} from '../party-member.model';
export type CombatType = 'none' | 'fixed' | 'random';

/** A combatant in a combat encounter */
export interface Combatant {
  /** The hyphenated-lower-case-unique-id of the combatant */
  readonly id: string;
  /** The name of the combatant */
  readonly name: string;
  /** The level of the combatant */
  readonly level: number;
  /** The sprite texture name, e.g. hugeSpider.png, kobold.png */
  readonly icon: string;
  /** The experience awarded for defeating this combatant */
  readonly exp: number;
  /** The gold awarded for defeating this combatant */
  readonly gold: number;
  /** The current hp of the combatant */
  readonly hp: number;
  /** The current mp of the combatant */
  readonly mp: number;
  /** The current hp of the combatant */
  readonly maxhp: number;
  /** The current mp of the combatant */
  readonly maxmp: number;

  // Combat ability values ----

  /** The lower bound of attack for the combatant */
  readonly attacklow: number;
  /** The upper bound of attack for the combatant */
  readonly attackhigh: number;
  /** The evasion value for the combatant */
  readonly evade: number;
  /** The hit percentage value for the combatant */
  readonly hitpercent: number;
}

/**
 * A Combat encounter descriptor.  Used to describe the configuration of combat.
 */
export interface CombatEncounter {
  /** unique id in spreadsheet https://goo.gl/JUPn00 */
  readonly id: string;
  /** array of enemies in this encounter */
  readonly enemies: Combatant[];
  /** array of enemies in this encounter */
  readonly party: PartyMember[];
  /** message to display when combat begins */
  readonly message?: string;
  /** The type of combat */
  readonly type?: CombatType;
}

/**
 * A Fixed combat encounter.
 *
 * Fixed encounters are ones that happen when you interact with some fixed part
 * of the game map.
 */
export interface CombatFixedEncounter extends CombatEncounter {
  /** The amount of gold to award the player after a victory */
  readonly gold?: number;
  /** The experience to divide amongst the party after a victory */
  readonly experience?: number;
  /** Any items to award the party after a victory */
  readonly items?: Item[];
}

/**
 * A Random combat encounter.
 *
 * Random encounters happen during movement about a map that has a `CombatEncounterComponent`
 * added to it.
 */
export interface CombatRandomEncounter extends CombatEncounter {
  /** array of zones this encounter can happen in */
  readonly zones: string[];
}

export type CombatEncounterTypes = CombatEncounter | CombatFixedEncounter | CombatRandomEncounter;

export interface CombatState {
  /** Is the current encounter loading */
  readonly loading: boolean;
  /** The index of the active encounter in encounters or -1 if there is no active encounter */
  readonly current: number;
  /** An array of encounters */
  readonly encounters: CombatEncounterTypes[];
}

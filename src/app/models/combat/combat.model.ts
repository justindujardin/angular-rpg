import {Item} from '../item/item.model';
import {BaseEntity} from '../being';
export type CombatType = 'none' | 'fixed' | 'random';

/** A combatant in a combat encounter */
export interface Combatant extends BaseEntity {
  /** The hyphenated-lower-case-unique-id of the combatant */
  readonly id?: string;
  /** The name of the combatant */
  readonly name?: string;
  /** The experience awarded for defeating this combatant */
  readonly exp?: number;
}

/**
 * A Combat encounter descriptor.  Used to describe the configuration of combat.
 */
export interface CombatEncounter {
  /** unique id in spreadsheet https://goo.gl/JUPn00 */
  readonly id: string;
  /** array of enemies in this encounter */
  readonly enemies: Combatant[];
  /**
   * Working copy of entity members in the combat simulation. When the combat
   * encounter is complete, the state of entity members will be transferred back
   * to the main game state entity. This allows us to encapsulate combat encounters
   * and potentially abort them without having to undo any actions on the game entity.
   */
  readonly party: Combatant[];
  /** message to display when combat begins */
  readonly message?: string;
  /** The type of combat */
  readonly type?: CombatType;
  /** The combat zone name, e.g. 'world-plains', 'sewer', ... */
  readonly zone?: string;
}

/**
 * A Fixed combat encounter.
 *
 * Fixed encounters are ones that happen when you interact with some fixed part
 * of the game world.
 */
export interface CombatFixedEncounter extends CombatEncounter {
  /** The amount of gold to award the player after a victory */
  readonly gold?: number;
  /** The experience to divide amongst the entity after a victory */
  readonly experience?: number;
  /** Any items to award the entity after a victory */
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

/** Union of valid CombatEncounter class types */
export type CombatEncounterTypes = CombatEncounter | CombatFixedEncounter | CombatRandomEncounter;

/** Union of either a CombatEncounter instance or false */
export type CombatCurrentType = CombatEncounterTypes | boolean;

export interface CombatState {
  /** Is the current encounter loading */
  readonly loading: boolean;
  /** The current encounter or null */
  readonly encounter: CombatEncounterTypes;
}

// Combat Behaviors

/** Description of a combat attackCombatant */
export interface CombatAttack {
  damage: number;
  attacker: BaseEntity;
  defender: BaseEntity;
}

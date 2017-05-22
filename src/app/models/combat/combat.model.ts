import {BaseEntity} from '../base-entity';
import {IPoint} from '../../../game/pow-core/point';
import * as Immutable from 'immutable';
import {Entity, EntityWithEquipment} from '../entity/entity.model';

/** Valid combat types */
export type CombatType = 'none' | 'fixed' | 'random';

/**
 * Describe a set of combat zones for a given point on a map.
 */
export interface IZoneMatch {
  /**
   * The zone name for the current map
   */
  map: string;
  /**
   * The zone name for the target location on the map
   */
  target: string;
  /**
   * The point that target refers to.
   */
  targetPoint: IPoint;
}

/** A combatant in a combat encounter */
export interface Combatant extends BaseEntity {
  /** The hyphenated-lower-case-unique-id of the combatant */
  readonly id?: string;
  /** The name of the combatant */
  readonly name?: string;
  /** The experience awarded for defeating this combatant */
  readonly exp?: number;
  /** The gold that can be looted aftefor defeating this combatant */
  readonly gold?: number;
}

export type CombatantTypes = Combatant | EntityWithEquipment;

/**
 * A Combat encounter descriptor.  Used to describe the configuration of combat.
 */
export interface CombatEncounter {
  /** The type of combat */
  readonly type: CombatType;
  /** array of enemies in this encounter */
  readonly enemies: Immutable.List<Combatant>;
  /**
   * Working copy of entity members in the combat simulation. When the combat
   * encounter is complete, the state of entity members will be transferred back
   * to the main game state. This allows us to encapsulate combat encounters
   * and potentially abort them without having to undo any actions on the game state.
   */
  readonly party: Immutable.List<Entity>;
  /** message to display when combat begins */
  readonly message?: string[];
  /** The amount of gold to award the player after a victory */
  readonly gold?: number;
  /** The experience to divide amongst the party after a victory */
  readonly experience?: number;
  /** Any items (by template id) to award the party after a victory */
  readonly items?: string[];
  /** The combat zone name, e.g. 'world-plains', 'sewer', ... */
  readonly zone?: string;
  /** unique id in spreadsheet https://goo.gl/JUPn00 */
  readonly id?: string;
}

/**
 * The combat state tree JS object
 */
export interface CombatState extends CombatEncounter {
  /** Is the current encounter loading */
  readonly loading: boolean;
}

// Combat Behaviors

/** Description of a combat attackCombatant */
export interface CombatAttack {
  damage: number;
  attacker: BaseEntity;
  defender: BaseEntity;
}

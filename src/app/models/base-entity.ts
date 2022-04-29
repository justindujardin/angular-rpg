export type EntityType = 'warrior' | 'ranger' | 'mage' | 'healer' | 'npc';

export type EntityStatuses = 'asleep' | 'posioned' | 'dead' | 'guarding' | 'paralyzed';

/**
 * Most basic entity only has an `eid` unique identifier for indexing.
 */
export interface IEntityObject {
  /** Instance ID */
  readonly eid: string;
  readonly name: string;
  /** Template ID */
  readonly id: string;
  readonly icon: string;
  readonly level: number;
  readonly status: EntityStatuses[];
}

export interface IPartyBaseStats {
  /** Used to calculate damage in combat when attacking */
  readonly strength: number[];
  /** Used to calculate evasion in combat when defending */
  readonly agility: number[];
  /** Used to calculate magic effect intensity and spell cost */
  readonly intelligence: number[];
  /** Used to calculate hit-point gains when leveling up */
  readonly vitality: number[];
  /** Increases chance to run and critical hit rate */
  readonly luck: number[];
  /** Increases hit accuracy and number of hits per attack */
  readonly hitpercent: number[];
  /** Increases defense to magic attacks */
  readonly magicdefense: number[];
  readonly hp: number;
  readonly mp: number;
}

export interface IEnemy extends IEntityObject {
  readonly hp: number;
  readonly maxhp: number;
  readonly exp: number;
  readonly gold: number;
  readonly attack: number;
  readonly magicdefense: number;
  readonly defense: number;
  readonly hitpercent: number;
}

export type PartyMemberStatNames = keyof IPartyBaseStats;

export interface IPartyMember extends IPartyBaseStats, IEntityObject {
  // The characters given name
  readonly name: string;
  // The class type
  readonly type: EntityType;
  readonly level: number;
  readonly exp: number;
  readonly maxhp: number;
  readonly maxmp: number;
}

export type CombatantTypes = IPartyMember | IEnemy;

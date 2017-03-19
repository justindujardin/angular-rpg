import {BaseEntity} from '../being';
export type EntityType = 'warrior' | 'thief' | 'mage' | 'healer' | 'npc';

export interface Entity extends BaseEntity {
  readonly type: EntityType;
  readonly exp: number;

  // Hidden attributes.
  readonly baseAttack: number; // ” = damage
  readonly baseDefense: number; // The base level of defense for the character class
  readonly baseMagic: number; // Higher magic = more powerful magic and more mana
  readonly baseSpeed: number; // Agility = evasion
}

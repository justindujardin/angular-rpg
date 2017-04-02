import {BaseEntity} from '../base-entity';
export type EntityType = 'warrior' | 'ranger' | 'mage' | 'healer' | 'npc';

export interface Entity extends BaseEntity {
  readonly type: EntityType;
  readonly exp: number;

  // Hidden attributes.
  readonly baseattack: number; // ” = damage
  readonly basedefense: number; // The base level of defense for the character class
  readonly basemagic: number; // Higher magic = more powerful magic and more mana
  readonly basespeed: number; // Agility = evasion
}

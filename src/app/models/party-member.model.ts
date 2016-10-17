export type PartyMemberType = 'warrior' | 'thief' | 'mage' | 'healer';

export interface PartyMember {
  readonly name?: string;
  readonly icon?: string;
  readonly type?: PartyMemberType;
  readonly level?: number;
  readonly hp?: number;
  readonly maxHP?: number;
  readonly exp?: number;
  readonly strength?: number;
  readonly vitality?: number;
  readonly intelligence?: number;
  readonly agility?: number;
  readonly dead?: boolean;
  readonly evade?: number; // The evasion of the creature.
  readonly hitpercent?: number; // The accuracy of the creature.
  readonly description?: string; // An description of the hero.
  readonly combatSprite?: string;
  // Hidden attributes.
  readonly baseStrength?: number; // Strength = damage
  readonly baseAgility?: number; // Agility = evasion
  readonly baseIntelligence?: number; // Higher intelligence = more powerful magic and more mana
  readonly baseVitality?: number; // The base level of vitality for the character class
  readonly hitPercentPerLevel?: number; // How much the hit% increases per level.
  // The experience required to advance to the next level.
  readonly nextLevelExp?: number;
  readonly prevLevelExp?: number;
}

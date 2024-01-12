import { IPartyMember, PartyMemberStatNames } from './base-entity';
/**
 * Leveling is important--It's the difference between being able to summon a chicken and
 * a dragon. That being said, there has not been enough thought put into this system. It
 * is still malleable if someone feels inspired.
 *
 * This file contains a set of functions that will return stat values related to leveling
 * game players. You can {@see getXPForLevel} or {@see getStrengthForLevel} and pass in the
 * associated {@see IPartyMember} model.
 *
 * @fileOverview
 */

//  TODO: Balance stats to be more in line with FF
//
// Has decent base stats explanation, and item stats:
// https://gamefaqs.gamespot.com/nes/522595-final-fantasy/faqs/57009

/**
 * Level experience breakpoints where each index represents how much experience is required
 * to advance to the next level. In this way the value of 0 for index 0 ensures that you will
 * always immediately advance to level 1 as a new character.
 */
const LEVEL_EXPERIENCE = [0, 12, 48, 96, 208, 400, 672, 1056, 1552, 2184, 2976];

export function getXPForLevel(level: number) {
  return LEVEL_EXPERIENCE[level === 0 ? level : level - 1];
}

export interface IClassLevelBonuses {
  /** The probability that the `strength` stat will increase during a level up */
  strength: number;
  /** The amount to increase `strength` by */
  strengthValue: number;
  /** The probability that the `agility` stat will increase during a level up */
  agility: number;
  /** The amount to increase `agility` by */
  agilityValue: number;
  /** The probability that the `intelligence` stat will increase during a level up */
  intelligence: number;
  /** The amount to increase `intelligence` by */
  intelligenceValue: number;
  /** The probability that the `vitality` stat will increase during a level up */
  vitality: number;
  /** The amount to increase `vitality` by */
  vitalityValue: number;
  /** The probability that the `luck` stat will increase during a level up */
  luck: number;
  /** The amount to increase `luck` by */
  luckValue: number;
}
/**
 * At each level up there is some chance that each of the classes
 * attributes may increase.
 *
 * The chance for a stat to increase is expressed as a value between
 * 0 and 1 and represents the probability that the stat will increase. You
 * can imagine that if you specified 0.9 as a value, about every 9 out of 10
 * times you level up, that stat will increase.
 *
 * When a stat increases on level up, it has a fixed amount by which it goes
 * up, and this amount can be different for each class. You can imagine that
 * if you strength=4 before leveling up, and you strengthValue=2, your strength
 * would be 6 after a level-up when the stat increases.
 */
export interface IClassStatLevelMap {
  /** The warrior class leveling configuration */
  warrior: IClassLevelBonuses;
  /** The ranger class leveling configuration */
  ranger: IClassLevelBonuses;
  /** The mage class leveling configuration */
  mage: IClassLevelBonuses;
  /** The healer class leveling configuration */
  healer: IClassLevelBonuses;
}

const CLASS_STAT_LEVEL_MAP: IClassStatLevelMap = {
  warrior: {
    strength: 0.9,
    strengthValue: 1,
    agility: 0.4,
    agilityValue: 1,
    intelligence: 0.0,
    intelligenceValue: 0,
    vitality: 0.75,
    vitalityValue: 2,
    luck: 0.2,
    luckValue: 1,
  },
  ranger: {
    strength: 0.7,
    strengthValue: 1,
    agility: 0.9,
    agilityValue: 1,
    intelligence: 0.0,
    intelligenceValue: 0,
    vitality: 0.75,
    vitalityValue: 1,
    luck: 0.9,
    luckValue: 2,
  },
  mage: {
    strength: 0.25,
    strengthValue: 1,
    agility: 0.35,
    agilityValue: 1,
    intelligence: 1.0,
    intelligenceValue: 1,
    vitality: 0.2,
    vitalityValue: 2,
    luck: 0.2,
    luckValue: 2,
  },
  healer: {
    strength: 0.25,
    strengthValue: 1,
    agility: 0.45,
    agilityValue: 2,
    intelligence: 1.0,
    intelligenceValue: 3,
    vitality: 0.3,
    vitalityValue: 4,
    luck: 0.2,
    luckValue: 2,
  },
};

export function getStatIncreaseForLevelUp(
  model: IPartyMember,
  name: PartyMemberStatNames,
): number {
  if (!CLASS_STAT_LEVEL_MAP.hasOwnProperty(model.type)) {
    throw new Error(`Unknown class: ${model.type}`);
  }
  const type: keyof IClassStatLevelMap = model.type as any;
  const data: any = CLASS_STAT_LEVEL_MAP[type];

  if (!data || !data.hasOwnProperty(name)) {
    throw new Error(`Invalid stat name: ${name}`);
  }
  const boostValue = `${name}Value`;
  if (!data || !data.hasOwnProperty(boostValue)) {
    throw new Error(`Invalid stat boost name: ${boostValue}`);
  }
  const isBoost = Math.random() < data[name];
  return isBoost ? data[boostValue] : 0;
}

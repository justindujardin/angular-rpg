import {Entity} from './entity/entity.model';
/**
 * Leveling is important--It's the difference between being able to summon a chicken and
 * a dragon. That being said, there has not been enough thought put into this system. It
 * is still malleable if someone feels inspired.
 *
 * This file contains a set of functions that will return stat values related to leveling
 * game players. You can {@see getXPForLevel} or {@see getStrengthForLevel} and pass in the
 * associated {@see Entity} model.
 *
 * @fileOverview
 */

/**
 * Level experience breakpoints where each index represents how much experience is required
 * to advance to the next level. In this way the value of 0 for index 0 ensures that you will
 * always immediately advance to level 1 as a new character.
 */
const LEVEL_EXPERIENCE = [
  0,
  32,
  96,
  208,
  400,
  672,
  1056,
  1552,
  2184,
  2976
];

export function getXPForLevel(level: number) {
  return LEVEL_EXPERIENCE[level === 0 ? level : level - 1];
}

export function getHPForLevel(level: number, model: Entity) {
  return Math.floor(model.defense * Math.pow(level, 1.1)) + (model.basedefense * 2);
}

export function getStrengthForLevel(level: number, model: Entity) {
  return Math.floor(model.baseattack * Math.pow(level, 0.65));
}

export function getAgilityForLevel(level: number, model: Entity) {
  return Math.floor(model.basespeed * Math.pow(level, 0.95));
}

export function getVitalityForLevel(level: number, model: Entity) {
  return Math.floor(model.basedefense * Math.pow(level, 0.95));
}

export function getIntelligenceForLevel(level: number, model: Entity) {
  return Math.floor(model.basemagic * Math.pow(level, 0.95));
}

import * as _ from "underscore";
import {Combatant} from "./combat.model";


export const BASE_CHANCE_TO_HIT: number = 168;
export const BASE_EVASION: number = 48;


export function isDefeated(test: Combatant) {
  return test.hp <= 0;
}


// Chance to hit = (BASE_CHANCE_TO_HIT + PLAYER_HIT_PERCENT) - EVASION
export function rollHit(attacker: Combatant, defender: Combatant): boolean {

  // TODO: Fix this calculation, which is producing too many misses
  // and causing the combat to feel too random and arbitrary.
  //return true;

  const roll: number = _.random(0, 200);
  const evasion: number = getEvasion(defender);
  const chance: number = BASE_CHANCE_TO_HIT + attacker.hitpercent - evasion;
  if (roll === 200) {
    return false;
  }
  if (roll === 0) {
    return true;
  }
  return roll <= chance;
}

export function damage(target: Combatant, amount: number): number {
  amount = Math.ceil(amount);
  console.warn('damage needs to happen in a reducer?');
  // TODO: Applying damage in reducer?
  // target.hp = Math.min(target.maxhp, Math.max(0, target.hp - amount));
  return amount;
}

export function getEvasion(target: Combatant): number {
  return 0;
}

export function attack(attacker: Combatant, defender: Combatant): number {
  const halfStrength = attacker.strength / 2;
  return damage(defender, halfStrength);
}

import {Being} from '../being';


export const BASE_CHANCE_TO_HIT: number = 168;
export const BASE_EVASION: number = 48;


export function isDefeated(test: Being) {
  return test.hp <= 0;
}



// Chance to hit = (BASE_CHANCE_TO_HIT + PLAYER_HIT_PERCENT) - EVASION
export function rollHit(attacker:Being, defender: Being): boolean {

  // TODO: Fix this calculation, which is producing too many misses
  // and causing the combat to feel too random and arbitrary.
  //return true;

  const roll: number = _.random(0, 200);
  const evasion: number = getEvasion(defender);
  const chance: number = BASE_CHANCE_TO_HIT + this.hitpercent - evasion;
  if (roll === 200) {
    return false;
  }
  if (roll === 0) {
    return true;
  }
  return roll <= chance;
}

export function damage(target:Being, amount: number): number {
  amount = Math.ceil(amount);
  this.hp = Math.min(this.maxhp, Math.max(0, this.hp - amount));
  if (this.hp <= 0) {
    this.set({dead: true});
  }
  return amount;
}

export function getEvasion(target:Being): number {
  return 0;
}

export function attack(attacker:Being, defender: Being): number {
  const halfStrength = this.strength / 2;
  return damage(defender, halfStrength);
}

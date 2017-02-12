import * as _ from 'underscore';
import {Combatant} from './combat.model';
import {Being} from '../being';

export function isDefeated(test: Being) {
  return test.hp <= 0;
}

// Chance to hit = (BASE_CHANCE_TO_HIT + PLAYER_HIT_PERCENT) - EVASION
export function rollHit(attacker: Combatant, defender: Combatant): boolean {
  const roll: number = _.random(0, 200);
  const attackerEvasion: number = getEvasion(attacker);
  const defenderEvasion: number = getEvasion(defender);
  const favorDodge = attackerEvasion < defenderEvasion;
  const chance: number = favorDodge ? 180 : 120; // TODO: Some real calculation here
  if (roll === 200) {
    return false;
  }
  if (roll === 0) {
    return true;
  }
  return roll <= chance;
}

export function damageCombatant(target: Combatant, amount: number): number {
  amount = Math.ceil(amount);
  console.warn('todo: post action for damage from here');
  // TODO: Applying damage in reducer?
  // target.hp = Math.min(target.maxhp, Math.max(0, target.hp - amount));
  return amount;
}

export function getEvasion(target: Combatant): number {
  return target.speed;
}

export function attackCombatant(attacker: Combatant, defender: Combatant): number {
  const amount = getAttackStrength(attacker);
  const damage = varyDamage(amount);
  if (rollHit(attacker, defender)) {
    return damageCombatant(defender, damage);
  }
  return 0;
}

export function getDefense(member: Combatant, base: boolean = false): number {
  return member.defense;
  // var obj: any = this;
  // var baseDefense: number = _.reduce(PARTY_ARMOR_TYPES, (val: number, type: string) => {
  //   var item: any = obj[type];
  //   if (!item) {
  //     return val;
  //   }
  //   return val + item.attributes.defense;
  // }, 0);
  // return baseDefense + (base ? 0 : defenseBuff);
}

export function getAttackStrength(combatant: Combatant): number {
  return getWeaponStrength(combatant) + combatant.attack / 2;
}

export function getMagicStrength(combatant: Combatant): number {
  return getWeaponStrength(combatant) + combatant.magic / 2;
}

export function getWeaponStrength(combatant): number {
  return 0;
}

/**
 * Given a base amount of damage, vary the output to be somewhere between 80% and 120%
 * of the input.
 */
export function varyDamage(amount: number): number {
  const max = amount * 1.2;
  const min = amount * 0.8;
  return Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min);
}

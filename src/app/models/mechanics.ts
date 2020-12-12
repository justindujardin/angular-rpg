import * as _ from 'underscore';
import { CombatantTypes, IEnemy, IPartyMember } from './base-entity';
import { EntityWithEquipment } from './entity/entity.model';
import { EntityItemTypes } from './entity/entity.reducer';
import {
  ITemplateArmor,
  ITemplateBaseItem,
  ITemplateMagic,
  ITemplateWeapon,
} from './game-data/game-data.model';
import { getStatIncreaseForLevelUp, getXPForLevel } from './levels';

/**
 * Query options used when calculating combat values
 */
export interface IMechanicsQuery<
  StateType = CombatantTypes,
  EquipmentType = ITemplateBaseItem,
  AgainstType = CombatantTypes
> {
  /** The query entity */
  state: StateType;
  /** Any weapons the query entity has equipped */
  equipment?: EquipmentType[];
  /**
   * An optional target entity that is associated with the query. What
   * this value means depends on the particular mechanics query function
   * that is being called.
   */
  against?: AgainstType | null;
}

/**
 * Combat and leveling mechanics for party members. This is used mainly for
 * calculating combat hits/misses/damage and leveling up character stats.
 */
export class PartyMechanics {
  static getAttack(query: IMechanicsQuery<IPartyMember, ITemplateWeapon>): number {
    const { state, equipment = [], against = null } = query;
    const weaponAttack: number = equipment
      // Assume it's a weapon
      .map((w) => w.attack)
      // Remove undefined values (maybe it was armor?)
      .filter((v) => v)
      // Sum the values
      .reduce((prev, next) => prev + next, 0);

    return weaponAttack + state.strength[0] / 2;
  }
  static getDefense(query: IMechanicsQuery<IPartyMember, ITemplateArmor>): number {
    const { state, equipment = [], against = null } = query;
    const totalDefense: number = equipment
      // Assume it's a piece of armor
      .map((w) => w.defense)
      // Remove falsy values (maybe it was a weapon?)
      .filter((v) => v)
      // Sum the values
      .reduce((prev, next) => prev + next, 0);
    return totalDefense;
  }
  static getEvasion(query: IMechanicsQuery<IPartyMember, ITemplateArmor>): number {
    const { state, equipment = [], against = null } = query;
    const armorWeight: number = equipment
      // Assume it's a piece of armor
      .map((w: ITemplateArmor) => w.weight)
      // Remove falsy values (maybe it was a weapon?)
      .filter((v) => v)
      // Sum the values
      .reduce((prev, next) => prev + next, 0);
    // This is the original FF evasion formula <3 :heart: <3
    return 48 + state.agility[0] - armorWeight;
  }
  /**
   * Calculate the hit percentage against the given enemy with the given weapons.
   *
   * Returns the hit percentage as a value between 0-100 (or more).
   * @param weapons The weapon(s) we have equipped
   * @param against The enemy (or null) we're trying to hit
   */
  static getHitPercent(query: IMechanicsQuery<IPartyMember, ITemplateWeapon>): number {
    const { state, equipment = [], against = null } = query;
    const weaponHitPercent: number = equipment
      // Assume it's a weapon
      .map((w) => w.hit)
      // Remove falsy values (maybe it was a weapon?)
      .filter((v) => v)
      // Sum the values
      .reduce((prev, next) => prev + next, 0);
    // Add the player hit percent to the sum of the weapons
    return state.hitpercent[0] + weaponHitPercent;
  }
}

/** Combat mechanics for Enemy entities */
export class EnemyMechanics {
  static getAttack(query: IMechanicsQuery<IEnemy>): number {
    return query.state.attack;
  }
  static getDefense(query: IMechanicsQuery<IEnemy>): number {
    return query.state.defense;
  }
  static getEvasion(query: IMechanicsQuery<IEnemy>): number {
    return 0;
  }
  static getHitPercent(query: IMechanicsQuery<IEnemy>): number {
    return query.state.hitpercent;
  }
}

export type MagicFunction = (
  caster: EntityWithEquipment,
  spell: ITemplateMagic,
  target: ICalculateMagicTarget
) => IMagicTargetDelta;

export interface ICombatDamage {
  attacker: CombatantTypes;
  defender: CombatantTypes;
  totalDamage: number;
  damages: number[];
}

export interface ICalculateDamageConfig {
  attackerType: 'party' | 'enemy';
  attacker: CombatantTypes;
  defenderType: 'party' | 'enemy';
  defender: CombatantTypes;
  attackerWeapons?: ITemplateWeapon[];
  defenderArmor?: ITemplateArmor[];
  verbose?: boolean;
}

/**
 * Describe the various effects that should be applied to the target of
 * this magic. The values are null if no change takes place.
 */
export interface IMagicTargetDelta {
  target: CombatantTypes;
  /** How many health points to add to the entity */
  healthDelta?: number;
  /** How many mana points to add to the entity */
  magicDelta?: number;
  /** A list of statuses to add to the entity */
  statusAdd?: string[];
  /** A list of statuses to remove from the entity */
  statusRemove?: string[];
  /** A list of template item ids to add to the entity's inventory */
  itemGive?: string[];
  /** A list of entity ids to remove from the target's inventory and add to the caster's inventory */
  itemTake?: string[];
  /** A list of entity item ids to destroy and remove from the entity's inventory */
  itemDestroy?: string[];
}

/**
 * A summary of the calculated effects a cast spell has on one or more targets and
 * the caster.
 */
export interface IMagicEffects {
  /** How many health points to add to the entity (usually negative) */
  healthDelta?: number;
  /** How many mana points to add to the entity (usually negative) */
  magicDelta?: number;
  /** The effects on each individual target */
  targets: IMagicTargetDelta[];
}

export interface ICalculateMagicTarget {
  entity: IEnemy | EntityWithEquipment;
  inventory: EntityItemTypes[];
  weapons: EntityItemTypes[];
  armors: EntityItemTypes[];
}

export interface ICalculateMagicEffectsConfig {
  casterType: 'party' | 'enemy';
  caster: CombatantTypes;
  targetsType: 'party' | 'enemy';
  targets: ICalculateMagicTarget[];
  spells?: ITemplateMagic[];
  verbose?: boolean;
}

export function calculateMagicEffects(
  config: ICalculateMagicEffectsConfig
): IMagicEffects {
  const magicEffectName = config.spells[0].effect as MagicFunctionNames;
  let spell: MagicFunction | null = SPELLS[magicEffectName];
  if (spell === null) {
    throw new Error('Unknown magic effect: ' + magicEffectName);
  }
  // Calculate effects for each target
  const targetDeltas: IMagicTargetDelta[] = config.targets.map(
    (target: ICalculateMagicTarget) => {
      return spell(config.caster as EntityWithEquipment, config.spells[0], target);
    }
  );

  return {
    magicDelta: config.spells[0].magiccost,
    targets: targetDeltas,
  };
}

export const SPELLS = {
  'elemental-damage': spellElementalDamage,
  'modify-hp': spellModifyHP,
  'modify-mp': spellModifyMP,
};
export type MagicFunctionNames = keyof typeof SPELLS;

export function spellElementalDamage(
  caster: EntityWithEquipment,
  spell: ITemplateMagic,
  target: ICalculateMagicTarget
): IMagicTargetDelta {
  // TODO: Check equipment for element-specific bonuses
  return {
    target: target.entity,
    healthDelta: -((spell.magnitude * caster.intelligence[0]) / 4),
  };
}

export function spellModifyHP(
  caster: EntityWithEquipment,
  spell: ITemplateMagic,
  target: ICalculateMagicTarget
): IMagicTargetDelta {
  // If the spell benefits a user, it restores health, otherwise it drains health.
  const directionMultiplier = spell.benefit ? 1 : -1;
  const delta = (spell.magnitude * caster.intelligence[0]) / 4;
  return {
    target: target.entity,
    healthDelta: delta * directionMultiplier,
  };
}

export function spellModifyMP(
  caster: EntityWithEquipment,
  spell: ITemplateMagic,
  target: ICalculateMagicTarget
): IMagicTargetDelta {
  // If the spell benefits a user, it restores mana, otherwise it drains mana.
  const directionMultiplier = spell.benefit ? 1 : -1;
  const delta = (spell.magnitude * caster.intelligence[0]) / 4;
  return {
    target: target.entity,
    magicDelta: delta * directionMultiplier,
  };
}

export function calculateDamage(config: ICalculateDamageConfig): ICombatDamage {
  const {
    attacker,
    attackerType,
    defender,
    defenderType,
    attackerWeapons = [],
    defenderArmor = [],
    verbose = true,
  } = config;
  const attackMechanics = attackerType === 'party' ? PartyMechanics : EnemyMechanics;
  const defenseMechanics = defenderType === 'party' ? PartyMechanics : EnemyMechanics;
  const roll: number = _.random(0, 200);
  const defenderEvasion: number = defenseMechanics.getEvasion({
    state: defender as any,
  });
  const hitPct = attackMechanics.getHitPercent({
    state: attacker as any, // NOTE: hacks because TS & the types here instead of | :(
    equipment: attackerWeapons,
    against: defender,
  });
  const hitChance = Math.min(160 + hitPct, 255) - defenderEvasion;
  let isHit = false;
  if (roll === 200) {
    isHit = false;
  } else if (roll === 0) {
    isHit = false;
  } else {
    isHit = roll <= hitChance;
  }
  if (!isHit) {
    return {
      attacker,
      defender,
      totalDamage: 0,
      damages: [],
    };
  }
  const tableData: { [key: string]: any }[] = [];
  const hitMultiply = 1;
  // The required hit percentage to land 2 consecutive hits
  const doubleHitThreshold = 32;
  // (1 + hitPct / doubleHitThreshold) * hitMultiplier
  // Min of 1, Max of 2
  const numHits = Math.min(
    2,
    Math.max(1, Math.floor((1 + hitPct / doubleHitThreshold) * hitMultiply))
  );
  const damages: number[] = [];
  for (let i = 0; i < numHits; i++) {
    const attackMin: number = attackMechanics.getAttack({
      state: attacker as any,
      equipment: attackerWeapons,
    });
    const attackMax = attackMin * 2;
    const adjustedAttack = Math.max(
      1,
      Math.floor(Math.random() * (attackMax - attackMin + 1)) + attackMin
    );
    const defense: number = defenseMechanics.getDefense({
      state: defender as any,
      equipment: defenderArmor,
    });

    let buffDefense: number = 0;
    // Apply guarding buff = Max(3, defense * 1.3)
    if (defender.status.indexOf('guarding') !== -1) {
      buffDefense = Math.max(3, Math.round(defense * 1.3));
    }
    const damage: number = Math.max(1, adjustedAttack - (defense + buffDefense));
    tableData.push({
      attacker: attacker,
      attack: adjustedAttack,
      damage: damage,
      defender: defender,
      defense: defense,
      buffDefense: buffDefense,
      hitPercentage: hitPct,
      hit: isHit,
    });
    damages.push(damage);
  }

  // Sum the values
  const totalDamage = Math.floor(damages.reduce((prev, next) => prev + next, 0));
  // Print attack summary to console
  if (verbose) {
    if (damages.length > 1) {
      tableData.push({ attacker: 'Total Damage', damage: totalDamage });
    }
    console.table(tableData);
  }
  return {
    attacker,
    defender,
    totalDamage,
    damages,
  };
}

export function awardLevelUp(model: IPartyMember): IPartyMember {
  const nextLevel: number = model.level + 1;
  const variedHPBonus = Math.max(10, model.level * 4) + Math.random() * 10;
  const bonusHP = model.level < 10 ? variedHPBonus : 0;
  const bonusMP =
    Math.random() * Math.max(2, (model.level * model.intelligence[0]) / 4);
  const deltaHP = Math.ceil(model.vitality[0] / 4 + bonusHP);
  let deltaMP = Math.ceil(model.intelligence[0] / 4 + bonusMP);
  if (model.intelligence[0] == 0) {
    deltaMP = 0;
  }
  const newHP = model.maxhp + deltaHP;
  const newMP = model.maxmp + deltaMP;
  const strength = newStatValue(
    model,
    model.strength,
    getStatIncreaseForLevelUp(model, 'strength')
  );
  const agility = newStatValue(
    model,
    model.agility,
    getStatIncreaseForLevelUp(model, 'agility')
  );
  const intelligence = newStatValue(
    model,
    model.intelligence,
    getStatIncreaseForLevelUp(model, 'intelligence')
  );
  const luck = newStatValue(
    model,
    model.luck,
    getStatIncreaseForLevelUp(model, 'luck')
  );
  const magicdefense = newStatValue(model, model.magicdefense);
  const hitpercent = newStatValue(model, model.hitpercent);
  return {
    ...model,
    level: nextLevel,
    maxhp: newHP,
    maxmp: newMP,
    mp: newMP,
    hp: newHP,
    strength,
    agility,
    intelligence,
    luck,
    magicdefense,
    hitpercent,
  };
}

export function awardExperience(exp: number, model: IPartyMember): IPartyMember {
  const newExp: number = model.exp + exp;
  let result: IPartyMember = {
    ...model,
    exp: newExp,
  };
  const nextLevel: number = getXPForLevel(model.level + 1);
  if (newExp >= nextLevel) {
    result = awardLevelUp(model);
  }
  return result;
}

export function newStatValue(
  model: IPartyMember,
  stat: number[],
  add: number = 0
): number[] {
  let newValue = stat[0] + add;
  if (stat.length > 1) {
    newValue += stat[1];
    return [newValue, stat[1]];
  }
  return [newValue];
}
export interface IPartyStatsDiff {
  /** The entity that was diff'd */
  readonly eid: string;
  /** The entity name */
  readonly name: string;
  /** The entity level */
  readonly level: number;
  /** How many health points were gained while leveling up */
  readonly hp: number;
  /** How many mana points were gained while leveling up */
  readonly mp: number;
  /** How many points strength was increased by while leveling up */
  readonly strength: number;
  /** How many points agility was increased by while leveling up */
  readonly agility: number;
  /** How many points intelligence was increased by while leveling up */
  readonly intelligence: number;
  /** How many points vitality was increased by while leveling up */
  readonly vitality: number;
  /** How many points luck was increased by while leveling up */
  readonly luck: number;
  /** How many points hitpercent was increased by while leveling up */
  readonly hitpercent: number;
  /** How many points magicdefense was increased by while leveling up */
  readonly magicdefense: number;
}

/**
 * Given two party member snapshots, return the delta between their
 * stat values. Useful for calculating stat increases while showing
 * level up notifications, e.g. "Strength went up by 3!"
 * @param before The party member data before
 * @param after The party member data after
 */
export function diffPartyMember(
  before: IPartyMember,
  after: IPartyMember
): IPartyStatsDiff {
  return {
    name: after.name,
    level: after.level,
    eid: after.eid,
    strength: after.strength[0] - before.strength[0],
    agility: after.agility[0] - before.agility[0],
    intelligence: after.intelligence[0] - before.intelligence[0],
    vitality: after.vitality[0] - before.vitality[0],
    luck: after.luck[0] - before.luck[0],
    hitpercent: after.hitpercent[0] - before.hitpercent[0],
    magicdefense: after.magicdefense[0] - before.magicdefense[0],
    hp: after.hp - before.hp,
    mp: after.mp - before.mp,
  };
}

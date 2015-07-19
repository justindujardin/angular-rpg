/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {ItemModel} from './itemModel';
import {CreatureModel} from './creatureModel';
import {GameStateModel} from './gameStateModel';
import {GameWorld} from '../gameWorld';
import {ArmorModel} from './armorModel';
import {WeaponModel} from './weaponModel';
import {EntityModel,EntityModelOptions} from './entityModel';


var levelExpChart = [
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


export var HeroTypes:any = {
  Warrior: "warrior",
  LifeMage: "mage",
  Necromancer: "necromancer",
  Ranger: "ranger"
};
export interface HeroModelOptions extends EntityModelOptions {
  type:string;
  description:string; // An description of the hero.

  combatSprite:string;

  // Hidden attributes.
  baseStrength:number; // Strength = damage
  baseAgility:number; // Agility = evasion
  baseIntelligence:number; // Higher intelligence = more powerful magic and more mana
  baseVitality:number; // The base level of vitality for the character class

  hitPercentPerLevel:number; // How much the hit% increases per level.

  // The experience required to advance to the next level.
  nextLevelExp:number;
  prevLevelExp:number;

}
export class HeroModel extends EntityModel {

  static MAX_LEVEL:number = 50;
  static MAX_ATTR:number = 50;
  static ARMOR_TYPES:string[] = [
    'head', 'body', 'arms', 'feet', 'accessory'
  ];
  weapon:WeaponModel;
  head:ArmorModel;
  body:ArmorModel;
  arms:ArmorModel;
  feet:ArmorModel;
  accessory:ArmorModel;
  game:GameStateModel;

  attributes:HeroModelOptions;

  /**
   * A constant buffer to add to defense of a player.
   *
   * TODO: This is probably a terrible way of buffing a character.
   *
   * Instead use a chain of modifiers?  e.g. PosionModifier, GuardingModifier,
   * ParalyzedModifier, etc.
   */
  defenseBuff:number = 0;

  static DEFAULTS:HeroModelOptions = {
    name: "Hero",
    icon: "",
    combatSprite: "",
    type: HeroTypes.Warrior,
    level: 1,
    exp: 0,
    nextLevelExp: 0,
    prevLevelExp: 0,
    hp: 0,
    maxHP: 6,
    description: "",
    // Hidden attributes.
    baseStrength: 0,
    baseAgility: 0,
    baseIntelligence: 0,
    baseVitality: 0,
    hitpercent: 5,
    hitPercentPerLevel: 1,
    evade: 0
  };

  defaults():any {
    return _.extend(super.defaults(), HeroModel.DEFAULTS);
  }

  // Equip a new piece of armor, and return any existing armor
  // that has been replaced by it.
  equipArmor(item:ArmorModel):ArmorModel {
    var slot:string = item.get('type');
    var obj:any = this;
    var oldArmor:ArmorModel;
    if (_.indexOf(HeroModel.ARMOR_TYPES, slot) !== -1) {
      oldArmor = obj[slot];
      obj[slot] = item;
    }
    return oldArmor;
  }

  // Remove a piece of armor.  Returns false if the armor is not equipped.
  unequipArmor(item:ArmorModel):boolean {
    var slot:string = item.get('type');
    var obj:any = this;
    var oldArmor:ArmorModel = obj[slot];
    if (!oldArmor || !slot) {
      return false;
    }
    obj[slot] = null;
    return true;
  }

  getEvasion():number {
    var obj:any = this;
    var evasionPenalty:number = _.reduce(HeroModel.ARMOR_TYPES, (val:number, type:string) => {
      var item:ArmorModel = obj[type];
      if (!item) {
        return val;
      }
      return val + item.attributes.evade;
    }, 0);
    return EntityModel.BASE_EVASION + this.attributes.agility + evasionPenalty;
  }

  attack(defender:EntityModel):number {
    var amount = this.getAttackStrength();
    var damage = this.calculateDamage(amount);
    if (this.rollHit(defender)) {
      return defender.damage(damage);
    }
    return 0;
  }

  getXPForLevel(level = this.attributes.level) {
    if (level == 0) {
      return 0;
    }
    return levelExpChart[level - 1];
  }


  getDefense(base:boolean = false):number {
    var obj:any = this;
    var baseDefense:number = _.reduce(HeroModel.ARMOR_TYPES, (val:number, type:string) => {
      var item:ArmorModel = obj[type];
      if (!item) {
        return val;
      }
      return val + item.attributes.defense;
    }, 0);
    return baseDefense + (base ? 0 : this.defenseBuff);
  }

  getAttackStrength():number {
    return this.getWeaponStrength() + this.attributes.strength / 2;
  }

  getMagicStrength():number {
    return this.getWeaponStrength() + this.attributes.intelligence / 2;
  }

  getWeaponStrength():number {
    return this.weapon ? this.weapon.attributes.attack : 0;
  }

  /**
   * Calculate damage for a given base amount.
   */
  calculateDamage(amount:number):number {
    var max = amount * 1.2;
    var min = amount * 0.8;
    return Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min);
  }

  awardExperience(exp:number):boolean {
    var newExp:number = this.attributes.exp + exp;
    this.set({
      exp: newExp
    });
    if (newExp >= this.attributes.nextLevelExp) {
      this.awardLevelUp();
      return true;
    }
    return false;
  }

  awardLevelUp() {
    var nextLevel:number = this.attributes.level + 1;
    var newHP = this.getHPForLevel(nextLevel);
    this.set({
      level: nextLevel,
      maxHP: newHP,
      // REMOVE auto-heal when you level up.  I think I'd rather people die from time-to-time.
      //hp: newHP,
      strength: this.getStrengthForLevel(nextLevel),
      agility: this.getAgilityForLevel(nextLevel),
      vitality: this.getVitalityForLevel(nextLevel),
      intelligence: this.getIntelligenceForLevel(nextLevel),

      nextLevelExp: this.getXPForLevel(nextLevel + 1),
      prevLevelExp: this.getXPForLevel(nextLevel)
    });
    this.trigger('levelUp', this);
  }

  fromString(data:any,world:GameWorld):boolean {
    try {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    }
    catch (e) {
      console.log("Failed to load save game.");
      return false;
    }
    if (!data) {
      return false;
    }

    var obj:any = this;
    _.each(HeroModel.ARMOR_TYPES, (type:string) => {
      if (data[type]) {
        obj[type] = world.itemModelFromId(data[type]);
      }
    });
    if (data.weapon) {
      this.weapon = world.itemModelFromId<WeaponModel>(data.weapon);
    }
    this.set(_.omit(data, _.flatten(['weapon', HeroModel.ARMOR_TYPES])));
    return true;
  }

  toJSON() {
    var obj:any = this;
    var result = super.toJSON();
    if (this.weapon) {
      result.weapon = this.weapon.get('id');
    }
    _.each(HeroModel.ARMOR_TYPES, (type:string) => {
      if (obj[type]) {
        result[type] = obj[type].get('id');
      }
    });
    return result;
  }

  getHPForLevel(level:number = this.attributes.level) {
    return Math.floor(this.attributes.vitality * Math.pow(level, 1.1)) + (this.attributes.baseVitality * 2);
  }

  getStrengthForLevel(level:number = this.attributes.level) {
    return Math.floor(this.attributes.baseStrength * Math.pow(level, 0.65));
  }

  getAgilityForLevel(level:number = this.attributes.level) {
    return Math.floor(this.attributes.baseAgility * Math.pow(level, 0.95));
  }

  getVitalityForLevel(level:number = this.attributes.level) {
    return Math.floor(this.attributes.baseVitality * Math.pow(level, 0.95));
  }

  getIntelligenceForLevel(level:number = this.attributes.level) {
    return Math.floor(this.attributes.baseIntelligence * Math.pow(level, 0.95));
  }


  static create(type:string, name:string) {
    var character:HeroModel = null;
    switch (type) {
      case HeroTypes.Warrior:
        character = new HeroModel({
          type: type,
          level: 0,
          name: name,
          icon: "warrior-male.png",
          baseStrength: 10,
          baseAgility: 2,
          baseIntelligence: 1,
          baseVitality: 7,
          hitpercent: 10,
          hitPercentPerLevel: 3
        });
        break;
      case HeroTypes.LifeMage:
        character = new HeroModel({
          type: type,
          name: name,
          level: 0,
          icon: "magician-female.png",
          baseStrength: 1,
          baseAgility: 6,
          baseIntelligence: 9,
          baseVitality: 4,
          hitpercent: 5,
          hitPercentPerLevel: 1
        });
        break;
      case HeroTypes.Ranger:
        character = new HeroModel({
          type: type,
          name: name,
          level: 0,
          icon: "ranger-female.png",
          baseStrength: 3,
          baseAgility: 10,
          baseIntelligence: 2,
          baseVitality: 5,
          hitpercent: 7,
          hitPercentPerLevel: 2
        });
        break;
      case HeroTypes.DeathMage:
        character = new HeroModel({
          type: type,
          name: name,
          level: 0,
          icon: "magician-male.png",
          baseStrength: 2,
          baseAgility: 10,
          baseIntelligence: 4,
          baseVitality: 4,
          hitpercent: 5,
          hitPercentPerLevel: 2
        });
        break;
      default:
        throw new Error("Unknown character class: " + type);
    }
    character.awardLevelUp();
    character.set({
      hp: character.get('maxHP')
    });
    return character;
  }
}

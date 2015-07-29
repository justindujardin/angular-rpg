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

import * as rpg from '../game';

export interface EntityModelOptions {
  name:string;
  icon:string; // The file name of a sprite source file
  level?:number;
  hp?:number;
  maxHP?:number;
  exp?:number;
  strength?:number;
  vitality?:number;
  intelligence?:number;
  agility?:number;
  dead?:boolean;
  evade:number; // The evasion of the creature.
  hitpercent:number; // The accuracy of the creature.
}

export class EntityModel extends Backbone.Model {
  // Base chance to hit number.
  static BASE_CHANCE_TO_HIT:number = 168;
  static BASE_EVASION:number = 48;

  // Evasion = BASE_EVASION + AGL - SUM(ArmorEvasionPenalty)
  // Hit% = WeaponAccuracy + Char Hit%
  static DEFAULTS:EntityModelOptions = {
    name: "Nothing",
    icon: "",
    level: 1,
    hp: 0,
    maxHP: 0,
    strength: 5,
    vitality: 4,
    intelligence: 1,
    agility: 1,
    dead: false,
    evade: 0,
    hitpercent: 1
  };

  defaults():any {
    return _.extend({}, EntityModel.DEFAULTS);
  }

  // Chance to hit = (BASE_CHANCE_TO_HIT + PLAYER_HIT_PERCENT) - EVASION
  rollHit(defender:EntityModel):boolean {

    // TODO: Fix this calculation, which is producing too many misses
    // and causing the combat to feel too random and arbitrary.
    //return true;

    var roll:number = _.random(0, 200);
    var evasion:number = defender.getEvasion();
    var chance:number = EntityModel.BASE_CHANCE_TO_HIT + this.attributes.hitpercent - evasion;
    if (roll === 200) {
      return false;
    }
    if (roll === 0) {
      return true;
    }
    return roll <= chance;
  }

  damage(amount:number):number {
    amount = Math.ceil(amount);
    this.set({hp: Math.min(this.attributes.maxHP, Math.max(0, this.attributes.hp - amount))});
    if (this.attributes.hp <= 0) {
      this.set({dead: true});
    }
    return amount;
  }

  getEvasion():number {
    return 0;
  }

  isDefeated():boolean {
    return this.attributes.hp <= 0;
  }

  attack(defender:EntityModel):number {
    var halfStrength = this.attributes.strength / 2;
    return defender.damage(halfStrength);
  }
}

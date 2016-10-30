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


import {Model} from 'backbone';
import * as _ from 'underscore';

export interface EntityModelOptions {
  /** The lowercase hyphenated unique id (e.g. green-snake, steel-sword, leather-armor) */
  id: string;
  /** The human readable name of the entity */
  name: string;
  /** The named sprite that represents this entity (e.g. greenSnake.png, steelSword.png, leatherArmor.png */
  icon: string;
}

export class EntityModel extends Model {
  // Base chance to hit number.
  static BASE_CHANCE_TO_HIT: number = 168;
  static BASE_EVASION: number = 48;

  // Evasion = BASE_EVASION + AGL - SUM(ArmorEvasionPenalty)
  // Hit% = WeaponAccuracy + Char Hit%
  static DEFAULTS: EntityModelOptions = {
    name: 'Invalid Entity',
    id: 'invalid-entity',
    icon: 'invalidEntity.png'
  };

  defaults(): any {
    return _.extend({}, EntityModel.DEFAULTS);
  }

  // Properties ----
  get icon(): string {
    return this.get('icon');
  }

  set icon(value: string) {
    this.set('icon', value);
  }

  get name(): string {
    return this.get('name');
  }

  set name(value: string) {
    this.set('name', value);
  }

  // Methods ----

  // Chance to hit = (BASE_CHANCE_TO_HIT + PLAYER_HIT_PERCENT) - EVASION
  rollHit(defender: EntityModel): boolean {

    // TODO: Fix this calculation, which is producing too many misses
    // and causing the combat to feel too random and arbitrary.
    //return true;

    var roll: number = _.random(0, 200);
    var evasion: number = defender.getEvasion();
    var chance: number = EntityModel.BASE_CHANCE_TO_HIT + this.attributes.hitpercent - evasion;
    if (roll === 200) {
      return false;
    }
    if (roll === 0) {
      return true;
    }
    return roll <= chance;
  }

  damage(amount: number): number {
    amount = Math.ceil(amount);
    this.set({hp: Math.min(this.maxhp, Math.max(0, this.hp - amount))});
    if (this.hp <= 0) {
      this.set({dead: true});
    }
    return amount;
  }

  getEvasion(): number {
    return 0;
  }

  isDefeated(): boolean {
    return this.attributes.hp <= 0;
  }

  attack(defender: EntityModel): number {
    var halfStrength = this.strength / 2;
    return defender.damage(halfStrength);
  }
}

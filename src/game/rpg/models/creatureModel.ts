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

import * as _ from 'underscore';
import {EntityModel, EntityModelOptions} from './entityModel';
import {HeroModel} from './heroModel';


export interface CreatureModelOptions extends EntityModelOptions {
  id: string; // The hyphenated-lower-case-unique-id of the creature
  name: string; // The creature name
  level: number;
  icon: string; // The file name of a sprite source file
  exp: number;
  gold: number;
  hp: number;
  mp: number;
  attacklow: number;
  attackhigh: number;
  evade: number;
  hitpercent: number;
}
export class CreatureModel extends EntityModel implements CreatureModelOptions {
  get hitpercent(): number {
    return this.get('hitpercent');
  }

  set hitpercent(value: number) {
    this.set('hitpercent', value);
  }

  get evade(): number {
    return this.get('evade');
  }

  set evade(value: number) {
    this.set('evade', value);
  }

  get attackhigh(): number {
    return this.get('attackhigh');
  }

  set attackhigh(value: number) {
    this.set('attackhigh', value);
  }

  get attacklow(): number {
    return this.get('attacklow');
  }

  set attacklow(value: number) {
    this.set('attacklow', value);
  }

  get mp(): number {
    return this.get('mp');
  }

  set mp(value: number) {
    this.set('mp', value);
  }

  get hp(): number {
    return this.get('hp');
  }

  set hp(value: number) {
    this.set('hp', value);
  }

  get gold(): number {
    return this.get('gold');
  }

  set gold(value: number) {
    this.set('gold', value);
  }

  get exp(): number {
    return this.get('exp');
  }

  set exp(value: number) {
    this.set('exp', value);
  }

  get icon(): string {
    return this.get('icon');
  }

  set icon(value: string) {
    this.set('icon', value);
  }

  get level(): number {
    return this.get('level');
  }

  set level(value: number) {
    this.set('level', value);
  }

  get name(): string {
    return this.get('name');
  }

  set name(value: string) {
    this.set('name', value);
  }

  static DEFAULTS: CreatureModelOptions = {
    id: 'invalid-creature',
    name: "Unnamed Creature",
    level: 0,
    icon: "noIcon.png",
    exp: 0,
    gold: 0,
    hp: 0,
    mp: 0,
    attacklow: 0,
    attackhigh: 0,
    evade: 0,
    hitpercent: 0
  };

  defaults(): any {
    return _.extend(super.defaults(), CreatureModel.DEFAULTS);
  }

  initialize(attributes?: any): void {
    super.initialize(attributes);
    // Set max values to the specified value for the creature.
    this.set({
      maxHP: attributes._hp,
      maxMP: attributes._mp
    })
  }

  attack(defender: EntityModel): number {
    var hero = <HeroModel>defender;
    var defense = hero.getDefense();
    var min = this.attacklow;
    var max = this.attackhigh;
    var damage = Math.floor(Math.random() * (max - min + 1)) + min;
    if (this.rollHit(defender)) {
      return defender.damage(Math.max(1, damage - defense));
    }
    return 0;
  }
}

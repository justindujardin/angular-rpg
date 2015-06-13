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

import {EntityModel,EntityModelOptions} from './entityModel';
import {HeroModel} from './heroModel';


export interface CreatureModelOptions extends EntityModelOptions {
  name:string; // The creature name
  icon:string; // The file name of a sprite source file
  groups: string[]; // Named groups this creature belongs to
  level:number;
  hp:number;
  strength:number;
  numAttacks:number;
  armorClass:number;
  description:string; // An description of the creature.
}
export class CreatureModel extends EntityModel {
  static DEFAULTS:CreatureModelOptions = {
    name: "Unnamed Creature",
    icon: "noIcon.png",
    groups: [],
    level: 0,
    hp: 0,
    exp: 0,
    strength: 0,
    numAttacks: 0,
    armorClass: 0,
    description: "",
    evade: 0,
    hitpercent: 1
  };

  defaults():any {
    return _.extend(super.defaults(), CreatureModel.DEFAULTS);
  }

  initialize(attributes?:any):void {
    super.initialize(attributes);
    // Set max values to the specified value for the creature.
    this.set({
      maxHP: attributes.hp,
      maxMP: attributes.mp
    })
  }

  attack(defender:EntityModel):number {
    var hero = <HeroModel>defender;
    var defense = hero.getDefense();
    var min = this.attributes.attacklow;
    var max = this.attributes.attackhigh;
    var damage = Math.floor(Math.random() * (max - min + 1)) + min;
    if (this.rollHit(defender)) {
      return defender.damage(Math.max(1, damage - defense));
    }
    return 0;
  }
}

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
import * as rpg from '../game';
import {ItemModel} from './itemModel';

export class ArmorModel extends ItemModel {
  static DEFAULTS: rpg.IGameArmor = {
    name: "No Armor",
    icon: "",
    defense: 0,
    evade: 0,
    cost: 0
  };

  defaults(): any {
    return _.extend(super.defaults(), ArmorModel.DEFAULTS);
  }

  get cost(): number {
    return this.get('cost');
  }

  set cost(value: number) {
    this.set('cost', value);
  }

  get evade(): number {
    return this.get('evade');
  }

  set evade(value: number) {
    this.set('evade', value);
  }

  get defense(): number {
    return this.get('defense');
  }

  set defense(value: number) {
    this.set('defense', value);
  }

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

}

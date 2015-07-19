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
import {ItemModel} from './itemModel';
import {EntityModel} from './entityModel';

export interface ISpellResult {

}

export class SpellModel extends ItemModel {
  static DEFAULTS:rpg.IGameSpell = {
    name: 'Invalid Spell',
    cost: 0,
    icon: '',
    level: 99,
    type: 'target',
    usedby: [],
    groups: 'default',
    elements: '',
    benefit: false,
    value: 0
  };

  defaults():any {
    return _.extend(super.defaults(), SpellModel.DEFAULTS);
  }

  /**
   * Cast a spell and resolve when it is complete.
   * @param caster The entity to cast the spell
   * @param target The target of the spell.
   */
  cast(caster:EntityModel, target:EntityModel):Promise<ISpellResult> {
    return new Promise<ISpellResult>((resolve, reject) => {
      resolve(null);
    });
  }
}

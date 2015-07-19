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
import {GameWorld} from '../gameWorld';
import {EntityModel} from '../models/entityModel';

export class GameEntityObject extends pow2.tile.TileObject {
  model:EntityModel;
  type:string; // TODO: enum?
  groups:any;
  world:GameWorld = pow2.getWorld<GameWorld>('rpg');

  constructor(options:any) {
    super(_.omit(options || {}, ["x", "y", "type"]));
    this.type = options.type || "player";
    this.groups = typeof options.groups === 'string' ? JSON.parse(options.groups) : options.groups;
    this.model = options.model || new EntityModel(options);
  }

  isDefeated():boolean {
    return this.model.isDefeated();
  }

  getSpells():rpg.IGameSpell[] {
    var spells:any = this.world.spreadsheet.getSheetData('magic');
    var userLevel:number = this.model.get('level');
    var userClass:string = this.model.get('type');
    return _.filter(spells, (spell:rpg.IGameSpell) => {
      return spell.level <= userLevel && _.indexOf(spell.usedby, userClass) !== -1;
    });
  }
}

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
import {GameWorld} from '../../../app/services/gameWorld';
import {TileObject} from '../../pow2/tile/tileObject';
import {Being} from '../../../app/models/being';
import {PartyMember} from '../../../app/models/party-member.model';

export class GameEntityObject extends TileObject {
  model: Being;
  type = 'player';
  groups: any;
  world: GameWorld;

  getSpells(): rpg.IGameSpell[] {
    const spells: any = this.world.spreadsheet.getSheetData('magic');
    const caster = this.model as PartyMember;
    const userLevel: number = caster.level;
    const userClass: string = caster.type;
    return _.filter(spells, (spell: rpg.IGameSpell) => {
      return spell.level <= userLevel && _.indexOf(spell.usedby, userClass) !== -1;
    });
  }
}

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
import {GameWorld} from '../services/game-world';
import {TileObject} from '../../game/pow2/tile/tile-object';
import {BaseEntity} from '../models/base-entity';
import {Entity} from '../models/entity/entity.model';
import {ITemplateMagic} from '../models/game-data/game-data.model';

export class GameEntityObject extends TileObject {
  model: BaseEntity;
  type = 'player';
  groups: any;
  world: GameWorld;

  getSpells(): ITemplateMagic[] {
    console.warn('no spell data available in GameEntityObject.getSpells');
    const spells: any = [];
    const caster = this.model as Entity;
    const userLevel: number = caster.level;
    const userClass: string = caster.type;
    return _.filter(spells, (spell: ITemplateMagic) => {
      return spell.level <= userLevel && _.indexOf(spell.usedby, userClass) !== -1;
    });
  }
}

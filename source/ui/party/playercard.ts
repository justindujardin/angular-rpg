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

import {Component, View, CSSClass} from 'angular2/angular2';
import {RPGSprite,RPGHealthBar} from '../rpg/all';
import {RPGGame} from '../services/all';
import {HeroModel} from '../../models/all';
import {MdProgressLinear} from '../material/components/all';

@Component({
  selector: 'player-card',
  properties: ['model']
})
@View({
  templateUrl: 'source/ui/party/playercard.html',
  directives: [RPGSprite, RPGHealthBar, CSSClass, MdProgressLinear]
})
export class PlayerCard {
  model:HeroModel;

  constructor(public game:RPGGame) {
  }

  getPlayerCSSClassMap():any {
    return {
      dead: this.model && this.model.attributes.hp <= 0
    }
  }

  getCSSProgressWidth():number {
    var width = 0;
    if (this.model) {
      width = (this.model.attributes.exp - this.model.attributes.prevLevelExp) / (this.model.attributes.nextLevelExp - this.model.attributes.prevLevelExp) * 100;
    }
    return Math.round(width);
  }
}

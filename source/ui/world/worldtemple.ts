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

import {Component,View,NgFor,NgIf,onDestroy} from 'angular2/angular2';
import '../../game';
import {TempleFeatureComponent} from '../../components/features/templeFeatureComponent';
import {HeroModel} from '../../models/all';
import {GameStateModel} from '../../models/gameStateModel';
import {RPGGame,Notify} from '../services/all';
import {RPGSprite,RPGHealthBar} from '../rpg/all';

@Component({
  selector: 'world-temple',
  properties: ['model', 'party', 'active', 'cost', 'icon', 'name'],
  lifecycle: [onDestroy]
})
@View({
  templateUrl: 'source/ui/world/worldtemple.html',
  directives: [NgFor, NgIf, RPGSprite, RPGHealthBar]
})
export class WorldTemple {

  static NAME:string = 'Mystery Temple';

  active:boolean = false;
  name:string = WorldTemple.NAME;
  icon:string = null;
  cost:number = 200;
  model:GameStateModel;
  party:HeroModel[];

  constructor(public game:RPGGame, public notify:Notify) {
    this.model = game.world.model;
    this.party = this.model.party;
    game.world.scene.on('temple:entered', (feature:TempleFeatureComponent) => {
      this.name = feature.name;
      this.icon = feature.icon;
      this.cost = parseInt(feature.cost);
      this.active = true;
    }, this);
    game.world.scene.on('temple:exited', () => {
      this.close();
    }, this);

  }

  onDestroy() {
    this.game.world.scene.off('temple:entered', null, this);
    this.game.world.scene.off('temple:exited', null, this);
    this.active = false;
  }

  rest() {
    if (!this.active) {
      return;
    }
    var model:GameStateModel = this.game.world.model;
    var money:number = model.gold;
    var cost:number = this.cost;

    var alreadyHealed:boolean = !_.find(model.party, (hero:HeroModel) => {
      return hero.get('hp') !== hero.get('maxHP');
    });


    if (cost > money) {
      this.notify.show("You don't have enough money");
    }
    else if (alreadyHealed) {
      this.notify.show("Keep your monies.\nYour party is already fully healed.");
    }
    else {
      //console.log("You have (" + money + ") monies.  Spending (" + cost + ") on temple");
      model.gold -= cost;
      _.each(model.party, (hero:HeroModel) => {
        hero.set({hp: hero.get('maxHP')});
      });
      this.notify.show("Your party has been healed! \nYou now have (" + model.gold + ") monies.", null, 2500);

    }
    this.close();


  }

  close() {
    this.cost = 200;
    this.name = WorldTemple.NAME;
    this.active = false;
  }
}

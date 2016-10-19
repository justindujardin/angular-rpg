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
import {Component, Input, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import {TempleFeatureComponent} from '../../../game/rpg/components/features/templeFeatureComponent';
import {HeroModel} from '../../../game/rpg/models/all';
import {GameStateModel} from '../../../game/rpg/models/gameStateModel';
import {RPGGame, Notify} from '../../services/index';
import {IScene} from '../../../game/pow2/interfaces/IScene';
import {WorldFeatureBase} from './world-feature';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
  selector: 'world-temple',
  styleUrls: ['./world-temple.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './world-temple.component.html'
})
export class WorldTemple extends WorldFeatureBase {

  eventName = 'temple';

  @Input() scene: IScene;


  private _name$ = new BehaviorSubject<string>('Mystery Temple');
  name$: Observable<string> = this._name$;

  @Input() set name(value: string) {
    this._name$.next(value);
  }

  private _active$ = new BehaviorSubject<boolean>(false);
  active$: Observable<boolean> = this._active$;

  @Input() set active(value: boolean) {
    this._active$.next(value);
  }

  private _icon$ = new BehaviorSubject<string>(null);
  icon$: Observable<string> = this._icon$;

  @Input() set icon(value: string) {
    this._icon$.next(value);
  }

  private _cost$ = new BehaviorSubject<number>(200);
  cost$: Observable<number> = this._cost$;

  @Input() set cost(value: number) {
    this._cost$.next(value);
  }

  @Input() model: GameStateModel;
  @Input() party: HeroModel[];

  onEnter(feature: TempleFeatureComponent) {
    this.name = feature.name;
    this.icon = feature.icon;
    this.cost = parseInt(feature.cost);
    this.active = true;
  }

  onExit(feature: TempleFeatureComponent) {
    this.cost = 200;
    this.active = false;
  }

  constructor(public game: RPGGame, public notify: Notify) {
    super();
    this.model = game.world.model;
    this.party = this.model.party;
  }

  rest() {
    if (!this._active$.value) {
      return;
    }
    const model: GameStateModel = this.game.world.model;
    const money: number = model.gold;
    const cost: number = this._cost$.value;

    const alreadyHealed: boolean = !_.find(model.party, (hero: HeroModel) => {
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
      _.each(model.party, (hero: HeroModel) => {
        hero.set({hp: hero.get('maxHP')});
      });
      this.notify.show("Your party has been healed! \nYou now have (" + model.gold + ") monies.", null, 2500);

    }
    this.active = false;
  }

}

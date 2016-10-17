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
import {Component, Input} from '@angular/core';
import {EntityModel} from '../../../game/rpg/models/all';

@Component({
  selector: 'rpg-health-bar',
  styleUrls: ['./rpgHealthBar.scss'],
  template: `<md-progress-bar [ngClass]="getCSSClassMap()" [value]="getProgressBarWidth()"></md-progress-bar>`
})
export class RPGHealthBar {
  @Input()
  model: EntityModel;

  getCSSClassMap(): {[className: string]: boolean} {
    if (!this.model || !this.model.attributes) {
      return {};
    }
    var pct: number = Math.round(this.model.attributes.hp / this.model.attributes.maxHP * 100);
    return {
      dead: pct === 0,
      critical: pct < 33,
      hurt: pct < 66,
      fine: pct > 66
    };
  }

  getProgressBarWidth(): number {
    var width = 0;
    if (this.model && this.model.attributes) {
      width = Math.ceil(this.model.attributes.hp / this.model.attributes.maxHP * 100);
    }
    return width;
  }


}

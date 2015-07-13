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
import '../../index';
import {Component,View,NgIf,CSSClass} from 'angular2/angular2';

import {EntityModel} from '../../models/all'

@Component({
  selector: 'rpg-health-bar',
  properties: ['model']
})
@View({
  template: `
  <div class="progress" [class]="getCSSClassMap()">
    <div class="progress-bar" [style.width]="getProgressBarWidth()"></div>
  </div>
`,
  directives: [NgIf, CSSClass]
})
export class RPGHealthBar {
  model:EntityModel;

  getCSSClassMap() {
    if (!this.model || !this.model.attributes) {
      return {};
    }
    var pct:number = Math.round(this.model.attributes.hp / this.model.attributes.maxHP * 100);
    return {
      dead: pct === 0,
      critical: pct < 33,
      hurt: pct < 66,
      fine: pct > 66
    };
  }

  getProgressBarWidth():string {
    if (!this.model || !this.model.attributes) {
      return '0';
    }
    var pct:number = Math.ceil(this.model.attributes.hp / this.model.attributes.maxHP * 100);
    return pct + '%';
  }


}

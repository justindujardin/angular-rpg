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


import {Component, View, CSSClass,ElementRef} from 'angular2/angular2';
import {RPGGame,Animate, Notify} from '../services/all';

@Component({
  selector: 'combat-damage',
  properties: ['position', 'classes', 'value']
})
@View({
  template: `
    <span class="damage-value"
          [class]="classes"
          [inner-text]="value"
          [style.top]="position?.y + 'px'"
          [style.left]="position?.x + 'px'">
    </span>
  `,
  directives: [CSSClass]
})
export class CombatDamage {

  classes:string[] = [];
  value:number = 0;
  position:pow2.Point = new pow2.Point();

  constructor(public elRef:ElementRef, public animate:Animate) {
    var anim:string = 'active';
    var element = elRef.nativeElement.querySelector('.damage-value');
    _.defer(()=> {
      animate.enter(element, anim).then(()=> {
        element.classList.remove('active');
        animate.enter(element, 'remove').then(()=> {
          element.classList.remove('remove');
        });
      });
    });
  }
}

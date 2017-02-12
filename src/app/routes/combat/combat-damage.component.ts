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
import {Component, Input, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {Animate} from '../../services/index';
import {Point} from '../../../game/pow-core/point';

@Component({
  selector: 'combat-damage',
  template: `
    <span #damageValue class="damage-value"
          [ngClass]="classes"
          [innerText]="value"
          [style.top]="position?.y + 'px'"
          [style.left]="position?.x + 'px'">
    </span>
  `,
  styleUrls: ['./combat-damage.component.scss']
})
export class CombatDamageComponent implements AfterViewInit {
  @Input() classes: string[] = [];
  @Input() value: number = 0;
  @Input() position: Point = new Point();
  @ViewChild('damageValue') damageValue: ElementRef;

  constructor(public animate: Animate) {
  }

  ngAfterViewInit(): void {
    const anim: string = 'active';
    const element = this.damageValue.nativeElement;
    if (!element) {
      return console.warn('unable to find damage value');
    }
    this.animate.enter(element, anim).then(() => {
      element.classList.remove('active');
      this.animate.enter(element, 'remove').then(() => {
        element.classList.remove('remove');
      });
    });
  }

}

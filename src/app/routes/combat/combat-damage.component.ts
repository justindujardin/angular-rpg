/*
Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import {
  animate,
  AnimationEvent,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Point } from '../../../app/core/point';
import { Animate } from '../../services/animate';

export interface ICombatDamageInputs {
  classes: { [clazz: string]: boolean };
  value: number;
  position: Point;
}

@Component({
  selector: 'combat-damage',
  template: `
    <span
      #damageValue
      *ngIf="!_expired"
      class="damage-value"
      [@show]="_expired == false"
      (@show.done)="triggerHide($event)"
      [ngClass]="classes"
      [innerText]="value"
      [style.top]="position.y + 'px'"
      [style.left]="position.x + 'px'"
    >
    </span>
  `,
  animations: [
    trigger('show', [
      transition(':enter', [
        style({ transform: 'translateY(25%)' }),
        animate('110ms', style({ transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)' }),
        animate('110ms', style({ transform: 'translateY(25%)' })),
      ]),
    ]),
  ],
  styleUrls: ['./combat-damage.component.scss'],
})
export class CombatDamageComponent implements ICombatDamageInputs, AfterViewInit {
  @Input() classes: { [clazz: string]: boolean } = {};
  @Input() value: number = 0;
  @Input() showFor: number = 1000;
  @Input() position: Point = new Point();

  /**
   * Emitted after the damage is hidden
   */
  @Output() onHide = new EventEmitter<CombatDamageComponent>();

  /**
   * Emitted immediately before the enter animation begins
   */
  @Output() onShow = new EventEmitter<CombatDamageComponent>();

  @ViewChild('damageValue') damageValue: ElementRef;

  public _expired = false;

  constructor(public animate: Animate) {}

  show(): Promise<void> {
    return new Promise((resolve) => {
      this.onShow.next(this);
      this._expired = false;
      setTimeout(() => {
        this._expired = true;
        resolve();
      }, this.showFor);
    });
  }
  triggerHide(event: AnimationEvent) {
    if (event.toState === 'void') {
      this.onHide.next(this);
    }
  }
  ngAfterViewInit(): void {
    this.show();
  }
}

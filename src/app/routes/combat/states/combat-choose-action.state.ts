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
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  Renderer,
  AfterViewInit,
  OnDestroy,
  Inject,
  forwardRef
} from '@angular/core';
import {GameEntityObject} from '../../../scene/game-entity-object';
import {CombatMachineState} from './combat-base.state';
import {CombatStateMachineComponent} from './combat.machine';
import {CombatBeginTurnStateComponent} from './combat-begin-turn.state';
import {CombatActionBehavior} from '../behaviors/combat-action.behavior';
import {ChooseActionType, ChooseActionStateMachine} from '../behaviors/choose-action.machine';
import {Point} from '../../../../game/pow-core/point';
import {Observable, BehaviorSubject, Subscription} from 'rxjs';
import {CombatComponent} from '../combat.component';

export interface IChooseActionEvent {
  players: GameEntityObject[];
  enemies: GameEntityObject[];
  choose: (action: CombatActionBehavior) => any;
}

/**
 * Describe a selectable menu item for a user input in combat.
 */
export interface ICombatMenuItem {
  select(): any;
  label: string;
}

/**
 * Choose actions for all characters in the player-card.
 */
@Component({
  selector: 'combat-choose-action-state',
  styleUrls: ['./combat-choose-action.state.scss'],
  template: `<ul *ngIf="items.length > 0" class="ebp action-menu">
  <li *ngFor="let item of items" (click)="item.select()" [innerText]="item.label"></li>
</ul>
<span #combatPointer
      class="point-to-player"
      [class.hidden]="!pointAt"
      [style.left]="(pointerPosition$ | async)?.x + 'px'"
      [style.top]="(pointerPosition$ | async)?.y + 'px'"
></span>
<ng-content></ng-content>`
})
export class CombatChooseActionStateComponent extends CombatMachineState implements AfterViewInit, OnDestroy {
  static NAME: string = 'Combat Choose Actions';
  name: string = CombatChooseActionStateComponent.NAME;
  pending: GameEntityObject[] = [];
  machine: CombatStateMachineComponent = null;

  @ViewChild('combatPointer') pointerElementRef: ElementRef;
  /**
   * Available menu items for selection.
   */
  @Input() items: ICombatMenuItem[] = [];

  @Input()
  pointAt: GameEntityObject = null;

  pointOffset: Point = new Point();
  private _pointerPosition$ = new BehaviorSubject(new Point());

  /** The screen translated pointer position */
  pointerPosition$: Observable<Point> = this._pointerPosition$.distinctUntilChanged();

  private _timerSubscription: Subscription;

  constructor(private renderer: Renderer,
              @Inject(forwardRef(() => CombatComponent)) private combat: CombatComponent) {
    super();
  }

  ngAfterViewInit(): void {
    // Every n milliseconds, update the pointer to track the current target
    this._timerSubscription = Observable.interval(50).do(() => {
      if (!this.pointAt || !this.combat) {
        return;
      }
      const targetPos: Point = new Point(this.pointAt.point);
      targetPos.y = (targetPos.y - this.combat.camera.point.y) + this.pointOffset.y;
      targetPos.x = (targetPos.x - this.combat.camera.point.x) + this.pointOffset.x;
      const screenPos: Point = this.combat.worldToScreen(targetPos, this.combat.cameraScale);
      this._pointerPosition$.next(screenPos);
    }).subscribe();
  }

  ngOnDestroy(): void {
    this._timerSubscription.unsubscribe();
  }

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    if (!machine.scene) {
      throw new Error('Invalid Combat Scene');
    }
    this.machine = machine;

    const combatants: GameEntityObject[] = [...machine.getLiveParty(), ...machine.getLiveEnemies()];
    machine.turnList = _.shuffle<GameEntityObject>(combatants);
    machine.current = machine.turnList.shift();
    machine.currentDone = true;

    this.pending = machine.getLiveParty();
    machine.playerChoices = {};

    // Trigger an event with a list of GameEntityObject player-card members to
    // choose an action for.   Provide a callback function that may be
    // invoked while handling the event to trigger status on the choosing
    // of moves.  Once data.choose(g,a) has been called for all player-card members
    // the state will transition to begin execution of player and enemy turns.
    const chooseData: IChooseActionEvent = {
      choose: (action: CombatActionBehavior) => {
        machine.playerChoices[action.from._uid] = action;
        this.pending = _.filter(this.pending, (p: GameEntityObject) => {
          return action.from._uid !== p._uid;
        });
        console.log(`${action.from.model.name} chose ${action.getActionName()}`);
        if (this.pending.length === 0) {
          machine.setCurrentState(CombatBeginTurnStateComponent.NAME);
        }
      },
      players: this.pending,
      enemies: machine.getLiveEnemies()
    };

    const choices: GameEntityObject[] = chooseData.players.slice();
    let inputState;

    const next = () => {
      const p: GameEntityObject = choices.shift();
      if (!p) {
        return;
      }
      inputState.current = p;
      inputState.setCurrentState(ChooseActionType.NAME);
    };
    const chooseSubmit = (action: CombatActionBehavior) => {
      inputState.data.choose(action);
      next();
    };
    inputState = new ChooseActionStateMachine(this, machine.scene, chooseData, chooseSubmit);
    next();

  }

  exit(machine: CombatStateMachineComponent) {
    this.machine = null;
    return super.exit(machine);
  }

  setPointerTarget(object: GameEntityObject, directionClass: string = 'right', offset: Point = new Point()) {
    const pointer: HTMLElement = this.pointerElementRef.nativeElement;
    this.renderer.setElementClass(pointer, 'left', false);
    this.renderer.setElementClass(pointer, 'right', false);
    this.renderer.setElementClass(pointer, directionClass, true);
    this.pointAt = object;
    this.pointOffset = offset;
  }

  addPointerClass(clazz: string) {
    this.renderer.setElementClass(this.pointerElementRef.nativeElement, clazz, true);
  }

  removePointerClass(clazz: string) {
    this.renderer.setElementClass(this.pointerElementRef.nativeElement, clazz, false);
  }

  hidePointer() {
    this.renderer.setElementClass(this.pointerElementRef.nativeElement, 'hidden', true);
  }

  showPointer() {
    this.renderer.setElementClass(this.pointerElementRef.nativeElement, 'hidden', false);
  }

}

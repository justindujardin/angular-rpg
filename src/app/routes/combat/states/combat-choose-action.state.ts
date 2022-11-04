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
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import * as _ from 'underscore';
import { Point } from '../../../../app/core/point';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { ChooseActionStateMachine } from '../behaviors/choose-action.machine';
import { CombatActionBehavior } from '../behaviors/combat-action.behavior';
import { CombatComponent } from '../combat.component';
import { ICombatMenuItem } from '../combat.types';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

export interface IChooseActionEvent {
  players: GameEntityObject[];
  enemies: GameEntityObject[];
  choose: (action: CombatActionBehavior) => any;
}

/**
 * Choose actions for all characters in the player-card.
 */
@Component({
  selector: 'combat-choose-action-state',
  styleUrls: ['./combat-choose-action.state.scss'],
  templateUrl: './combat-choose-action.state.html',
})
export class CombatChooseActionStateComponent
  extends CombatMachineState
  implements AfterViewInit, OnDestroy
{
  static NAME: CombatStateNames = 'choose-action';
  name: CombatStateNames = CombatChooseActionStateComponent.NAME;
  pending: GameEntityObject[] = [];
  machine: CombatStateMachineComponent | null = null;
  pointerOffset: Point = new Point(0, 0);

  @ViewChild('combatPointer') pointerElementRef: ElementRef;
  /**
   * Available menu items for selection.
   */
  @Input() items: ICombatMenuItem[] = [];

  @Input() pointAt: GameEntityObject | null = null;
  @Input() combat: CombatComponent | null = null;

  pointOffset: Point = new Point();
  private _pointerPosition$ = new BehaviorSubject(new Point());

  private _currentMachine: ChooseActionStateMachine | null = null;

  /** The screen translated pointer position */
  pointerPosition$: Observable<Point> = this._pointerPosition$.pipe(
    distinctUntilChanged()
  );

  private _timerSubscription?: Subscription;

  constructor(private renderer: Renderer2) {
    super();
  }

  ngAfterViewInit(): void {
    // Every n milliseconds, update the pointer to track the current target
    this._timerSubscription = interval(50).subscribe(() => {
      if (!this.pointAt || !this.combat) {
        return;
      }
      const targetPos: Point = new Point(this.pointAt.point);
      targetPos.y = targetPos.y - this.combat.camera.point.y + this.pointOffset.y;
      targetPos.x = targetPos.x - this.combat.camera.point.x + this.pointOffset.x;
      const screenPos: Point = this.combat.worldToScreen(
        targetPos,
        this.combat.cameraScale
      );
      this._pointerPosition$.next(screenPos);
    });
  }

  ngOnDestroy(): void {
    this._timerSubscription?.unsubscribe();
  }

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    if (!machine.scene) {
      throw new Error('Invalid Combat Scene');
    }
    this.machine = machine;

    const combatants: GameEntityObject[] = [
      ...machine.getLiveParty(),
      ...machine.getLiveEnemies(),
    ];
    machine.turnList = _.shuffle<GameEntityObject>(combatants);
    machine.current = machine.turnList.shift() || null;
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
        const id = action.from?._uid || -1;
        machine.playerChoices[id] = action;
        this.pending = _.filter(this.pending, (p: GameEntityObject) => {
          return id !== p._uid;
        });
        console.log(`${action.from?.model?.name} chose ${action.getActionName()}`);
        if (this.pending.length === 0) {
          machine.setCurrentState('begin-turn');
        }
      },
      players: this.pending,
      enemies: machine.getLiveEnemies(),
    };

    const choices: GameEntityObject[] = chooseData.players.slice();

    const next = () => {
      const p: GameEntityObject | null = choices.shift() || null;
      if (!p || !this._currentMachine) {
        this._currentMachine = null;
        return;
      }
      this._currentMachine.current = p;
      this._currentMachine.setCurrentState('choose-action');
    };
    const chooseSubmit = (action: CombatActionBehavior) => {
      if (this._currentMachine) {
        this._currentMachine.data.choose(action);
      }
      next();
    };
    this._currentMachine = new ChooseActionStateMachine(
      this,
      machine.scene,
      chooseData,
      chooseSubmit
    );
    next();
  }

  exit(machine: CombatStateMachineComponent) {
    this.machine = null;
    return super.exit(machine);
  }

  setPointerTarget(
    object: GameEntityObject,
    directionClass: 'left' | 'right' = 'right'
  ) {
    const pointer: HTMLElement = this.pointerElementRef.nativeElement;
    this.renderer.removeClass(pointer, 'left');
    this.renderer.removeClass(pointer, 'right');
    this.renderer.addClass(pointer, directionClass);
    this.pointAt = object;
    this.pointOffset = this.pointerOffset;
  }

  /** Point at the object represented by the given menu item */
  pointAtItem(item: ICombatMenuItem) {
    // Only support targeting enemies rn
    if (item.source instanceof GameEntityObject) {
      this.pointAt = item.source;
      this.setPointerTarget(item.source, 'left');
      if (this._currentMachine) {
        this._currentMachine.target = item.source;
      }
    }
  }

  addPointerClass(clazz: string) {
    this.renderer.addClass(this.pointerElementRef.nativeElement, clazz);
  }

  removePointerClass(clazz: string) {
    this.renderer.removeClass(this.pointerElementRef.nativeElement, clazz);
  }

  hidePointer() {
    this.renderer.addClass(this.pointerElementRef.nativeElement, 'hidden');
  }

  showPointer() {
    this.renderer.removeClass(this.pointerElementRef.nativeElement, 'hidden');
  }
}

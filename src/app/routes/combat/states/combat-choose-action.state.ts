import { Component, Input } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import * as _ from 'underscore';
import { Point } from '../../../../app/core/point';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { SceneView } from '../../../scene/scene-view';
import { CombatAttackBehaviorComponent } from '../behaviors/actions';
import { ChooseActionStateMachine } from '../behaviors/choose-action.machine';
import { CombatActionBehavior } from '../behaviors/combat-action.behavior';
import { ICombatMenuItem } from '../combat.types';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

/**
 * Choose actions for all characters in the player-card.
 */
@Component({
  selector: 'combat-choose-action-state',
  styleUrls: ['./combat-choose-action.state.scss'],
  templateUrl: './combat-choose-action.state.html',
})
export class CombatChooseActionStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'choose-action';
  name: CombatStateNames = CombatChooseActionStateComponent.NAME;
  pending: GameEntityObject[] = [];
  machine: CombatStateMachineComponent | null = null;

  /** Pointer offset when pointing left */
  static LEFT_OFFSET = new Point(0.5, -0.25);
  /** Pointer offset when pointing right */
  static RIGHT_OFFSET = new Point(-1, -0.25);

  /** Available menu items for selection. */
  @Input() items: ICombatMenuItem[] = [];
  /** Game entity to point at with the pointer */
  @Input() pointAt: GameEntityObject | null = null;
  /** Which way is the pointer pointing? */
  @Input() pointAtDir: 'left' | 'right' = 'left';
  /** Show the pointer? */
  @Input() pointer: boolean = false;
  /** CSS class to add to the pointer */
  @Input() pointerClass: string = '';
  /** The scene view container. Used to calculating screen space pointer coordinates */
  @Input() view: SceneView | null = null;

  private _autoCombat$ = new BehaviorSubject<boolean>(false);
  /** Automatically select moves for players for interactionless combat */
  @Input() set autoCombat(value: boolean) {
    this._autoCombat$.next(value);
    if (value && this.machine) {
      this._doAutoSelection();
    }
  }
  get autoCombat(): boolean {
    return this._autoCombat$.value;
  }

  private _currentMachine: ChooseActionStateMachine | null = null;
  private toChoose: GameEntityObject[] = [];

  /** The screen translated pointer position */
  pointerPosition$: Observable<Point> = interval(50).pipe(
    map((): Point | boolean => {
      if (!this.pointAt || !this.view) {
        return false;
      }

      // World offset from object origin (0.5,0.5) is bottom right (-0.5,-0.5) top left
      const offset =
        this.pointAtDir === 'left'
          ? CombatChooseActionStateComponent.LEFT_OFFSET
          : CombatChooseActionStateComponent.RIGHT_OFFSET;
      // World player point
      const targetPos: Point = new Point(this.pointAt.point);
      // Subtract camera point to make world relative to upper-left of the camera
      targetPos.subtract(this.view.camera.point);
      // Add the offset (so we don't point at object center)
      targetPos.add(offset);
      // Convert to screen coordinates
      const screenPos: Point = this.view.worldToScreen(
        targetPos,
        this.view.cameraScale,
      );
      return screenPos;
    }),
    filter<Point>(Boolean),
    distinctUntilChanged(),
  );

  async enter(machine: CombatStateMachineComponent) {
    super.enter(machine);
    assertTrue(machine.scene, 'Invalid Combat Scene');
    this.machine = machine;

    this.pending = machine.getLiveParty();
    this.toChoose = this.pending.slice();

    machine.turnList = _.shuffle([
      ...machine.getLiveParty(),
      ...machine.getLiveEnemies(),
    ]);
    machine.current = machine.turnList.shift() || null;
    machine.currentDone = true;
    machine.playerChoices = {};

    if (this.autoCombat) {
      return this._doAutoSelection();
    }

    this._currentMachine = new ChooseActionStateMachine(
      this,
      machine.scene,
      this.pending,
      machine.getLiveEnemies(),
      this.submitChoice.bind(this),
    );
    this._next();
  }

  async exit(machine: CombatStateMachineComponent) {
    this.machine = null;
    return super.exit(machine);
  }

  submitChoice(action: CombatActionBehavior) {
    if (this._currentMachine && this.machine) {
      const id = action.from?._uid || -1;
      this.machine.playerChoices[id] = action;
      this.pending = this.pending.filter((p: GameEntityObject) => {
        return id !== p._uid;
      });
      console.log(`${action.from?.model?.name} chose ${action.name}`);
      if (this.pending.length === 0) {
        this.machine.setCurrentState('begin-turn');
      }
    }
    this._next();
  }

  private _doAutoSelection() {
    const remainder = [...this.toChoose];
    if (this._currentMachine?.current) {
      remainder.unshift(this._currentMachine.current);
    }
    if (this._currentMachine) {
      this._currentMachine.destroy();
      this._currentMachine = null;
    }
    this.toChoose.length = 0;
    this.pointer = false;
    this.pointerClass = '';

    assertTrue(this.machine, 'invalid state machine');

    for (let i = 0; i < remainder.length; i++) {
      const player = remainder[i];
      // TODO: Support more than attack actions
      const action = player.findBehavior<CombatAttackBehaviorComponent>(
        CombatAttackBehaviorComponent
      );

      assertTrue(this.machine.enemies, 'no enemies');
      const enemy = this.machine.enemies.toArray()[0];

      assertTrue(action, `attack action not found on: ${player.name}`);
      const id = player._uid;
      action.from = player;
      action.to = enemy;
      this.machine.playerChoices[id] = action;
      console.log(`[autoCombat] ${player.model?.name} chose ${action.name}`);
    }
    this.machine.setCurrentState('begin-turn');
  }

  private _next() {
    const p: GameEntityObject | null = this.toChoose.shift() || null;
    if (!p || !this._currentMachine) {
      this._currentMachine = null;
      return;
    }
    this._currentMachine.current = p;
    this._currentMachine.setCurrentState('choose-action');
  }

  /** Show the pointer element next to the given object, aligned to left/right side */
  setPointerTarget(
    object: GameEntityObject | null,
    directionClass: 'left' | 'right' = 'right',
  ) {
    this.pointAtDir = directionClass;
    this.pointAt = object;
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
}

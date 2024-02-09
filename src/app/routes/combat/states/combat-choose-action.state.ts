
import { Component, Input } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import * as _ from 'underscore';
import { Point } from '../../../../app/core/point';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { SceneView } from '../../../scene/scene-view';
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
        this.view.cameraScale
      );
      return screenPos;
    }),
    filter<Point>(Boolean),
    distinctUntilChanged()
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

    this._currentMachine = new ChooseActionStateMachine(
      this,
      machine.scene,
      this.pending,
      machine.getLiveEnemies(),
      this.submitChoice.bind(this)
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
    directionClass: 'left' | 'right' = 'right'
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

import { Component, Input } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import * as _ from 'underscore';
import { Point } from '../../../../app/core/point';
import { Item, Magic } from '../../../models/item';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { SceneView } from '../../../scene/scene-view';
import {
  CombatAttackBehaviorComponent,
  CombatItemBehavior,
  CombatMagicBehavior,
} from '../behaviors/actions';
import { ChooseActionStateMachine } from '../behaviors/choose-action.machine';
import { CombatActionBehavior } from '../behaviors/combat-action.behavior';
import { CombatPlayerComponent } from '../combat-player.component';
import { ICombatMenuItem } from '../combat.types';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

export function chooseMove(
  player: GameEntityObject,
  enemies: GameEntityObject[],
  party: CombatPlayerComponent[],
  spells: Magic[],
  items: Item[],
): CombatActionBehavior {
  const magicAction = player.findBehavior<CombatMagicBehavior>(CombatMagicBehavior);
  const hurtPartyMember = party
    // Sort the member with least HP to the front
    .sort((a, b) => (a.model.hp < b.model.hp ? -1 : 1))
    // Find a member with < threshold hp
    .find((p) => p.model.hp < p.model.maxhp * 0.65);

  // Choose the enemy with the least HP
  const enemy = enemies.sort((a, b) => {
    const aHP = a?.model?.hp as number;
    const bHP = b?.model?.hp as number;
    return aHP < bHP ? -1 : 1;
  })[0];

  // Magic User
  if (magicAction && magicAction.canBeUsedBy(player)) {
    const hasHeal = spells.find((s) => s.id === 'heal');
    const hasPush = spells.find((s) => s.id === 'push');

    // Heal hurt party members
    if (hurtPartyMember && hasHeal) {
      magicAction.from = player;
      magicAction.to = hurtPartyMember;
      magicAction.spell = hasHeal;
      return magicAction;
    }

    // Hurt enemies
    if (hasPush) {
      magicAction.from = player;
      magicAction.to = enemy;
      magicAction.spell = hasPush;
      return magicAction;
    }
  }

  // Usable items
  const itemAction = player.findBehavior<CombatItemBehavior>(CombatItemBehavior);
  if (itemAction && itemAction.canBeUsedBy(player)) {
    const hasPotion = items.find((i) => i.id.includes('potion'));
    // Use potions on hurt party members
    if (hurtPartyMember && hasPotion) {
      itemAction.from = player;
      itemAction.to = hurtPartyMember;
      itemAction.item = hasPotion;
      return itemAction;
    }
  }

  // Default to attacking
  const action = player.findBehavior<CombatAttackBehaviorComponent>(
    CombatAttackBehaviorComponent,
  );
  assertTrue(action, `attack action not found on: ${player.name}`);
  action.from = player;
  action.to = enemy;
  return action;
}

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
    let items: Item[] = this.machine.items.toJS();

    for (let i = 0; i < remainder.length; i++) {
      const player = remainder[i];

      assertTrue(this.machine.party, 'no party');
      const party = this.machine.party.toArray().filter((p) => p.model.hp > 0);

      assertTrue(this.machine.enemies, 'no enemies');
      const enemies = this.machine.enemies
        .toArray()
        .filter((p) => Number(p.model?.hp) > 0);

      const action = chooseMove(
        player,
        enemies,
        party,
        this.machine.spells.toJS(),
        items,
      );

      // Filter used items from next user choices
      if (action.item) {
        items = items.filter((i) => i.eid !== action.item?.eid);
      }
      this.machine.playerChoices[player._uid] = action;
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

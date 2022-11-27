import * as Immutable from 'immutable';
import { Subscription } from 'rxjs';
import { State } from '../../../core/state';
import { StateMachine } from '../../../core/state-machine';
import { ITemplateMagic } from '../../../models/game-data/game-data.model';
import { Item, Magic } from '../../../models/item';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { Scene } from '../../../scene/scene';
import { GameWorld } from '../../../services/game-world';
import { CombatActionBehavior } from '../behaviors/combat-action.behavior';
import { CombatPlayerComponent } from '../combat-player.component';
import { CombatSceneClick, ICombatMenuItem, IPlayerAction } from '../combat.types';
import { CombatChooseActionStateComponent } from '../states/combat-choose-action.state';

/**
 * The enumeration of states used in the Combat choose action state machine.
 */
export type CombatChooseActionStateNames =
  | 'choose-target'
  | 'choose-action'
  | 'choose-item'
  | 'choose-spell'
  | 'submit-choice';

/**
 * A state machine to represent the various UI states involved in
 * choosing a combat action.
 *
 * ```
 *
 *     +------+   +--------+   +--------+
 *     | type |-->| target |-->| submit |
 *     +------+   +--------+   +--------+
 *
 * ```
 *
 * When the user properly selects an action type (Attack, Magic, Item)
 * and a target to apply the action to (Hero, All Enemies, etc.) the
 * submit state will apply the selection to the state machine at which
 * point the implementation may do whatever it wants.
 */
export class ChooseActionStateMachine extends StateMachine<CombatChooseActionStateNames> {
  current: GameEntityObject | null = null;
  target: GameEntityObject | null = null;
  action: CombatActionBehavior | null = null;
  spell: ITemplateMagic | null = null;
  item: Item | null = null;
  world: GameWorld | null = GameWorld.get();

  constructor(
    public parent: CombatChooseActionStateComponent,
    public scene: Scene,
    public players: GameEntityObject[],
    public enemies: GameEntityObject[],
    submit: (action: CombatActionBehavior) => any
  ) {
    super();
    this.states = [
      new ChooseActionTarget(),
      new ChooseActionType(),
      new ChooseUsableItem(),
      new ChooseMagicSpell(),
      new ChooseActionSubmit(submit),
    ];
  }
}

/**
 * Choose a specific action type to apply in combat.
 */
export class ChooseActionType extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'choose-action';
  name: CombatChooseActionStateNames = ChooseActionType.NAME;

  async enter(machine: ChooseActionStateMachine) {
    const combat = machine.parent.machine;
    assertTrue(combat, 'invalid link to combat state machine');
    let sub: Subscription | null = null;

    let clickSelect = (click: CombatSceneClick) => {
      sub?.unsubscribe();
      sub = null;
      machine.target = click.hits[0];
      machine.parent.items[0].select();
    };
    assertTrue(machine.current, 'Requires Current Player');
    const player = machine.current as CombatPlayerComponent;
    machine.parent.setPointerTarget(null, 'right');
    machine.action = machine.target = machine.spell = machine.item = null;
    // Enable menu selection of action type.
    const selectAction = (action: IPlayerAction) => {
      machine.action = action as CombatActionBehavior;
      sub?.unsubscribe();
      sub = null;
      if (machine.action.name == 'magic') {
        machine.setCurrentState(ChooseMagicSpell.NAME);
      } else if (machine.action.name == 'item') {
        machine.setCurrentState(ChooseUsableItem.NAME);
      } else if (machine.action.canTarget()) {
        machine.setCurrentState(ChooseActionTarget.NAME);
      } else {
        machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };

    const items = player
      .findBehaviors(CombatActionBehavior)
      .filter((c: CombatActionBehavior) => c.canBeUsedBy(player));
    machine.parent.items = items.map((a: CombatActionBehavior) => {
      return {
        select: selectAction.bind(this, a),
        label: a.name,
        id: a._uid,
      };
    });

    await player.moveForward();
    machine.parent.setPointerTarget(player, 'right');
    machine.parent.pointer = true;
    sub = combat.onClick$.subscribe(clickSelect);
  }

  async exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}
/**
 * Choose a magic spell to cast in combat.
 */
export class ChooseMagicSpell extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'choose-spell';
  name: CombatChooseActionStateNames = ChooseMagicSpell.NAME;

  async enter(machine: ChooseActionStateMachine) {
    assertTrue(machine.current, 'Requires Current Player');
    const combat = machine.parent.machine;
    assertTrue(combat, 'invalid link to combat state machine');
    const spells = machine.parent.machine?.spells as Immutable.List<ITemplateMagic>;
    assertTrue(spells, 'no known spells');

    const selectSpell = (spell: ITemplateMagic) => {
      machine.spell = spell;
      if (spell.benefit) {
        machine.target = machine.current;
      }
      assertTrue(spell.target === 'target', 'Multiple target spells not implemented');
      machine.setCurrentState(ChooseActionTarget.NAME);
    };

    machine.parent.items = spells.toJS().map((a: Magic): ICombatMenuItem => {
      return {
        select: selectSpell.bind(this, a),
        label: a.magicname,
        id: a.eid,
      };
    });
  }

  async exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}
/**
 * Choose an item to use in combat.
 */
export class ChooseUsableItem extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'choose-item';
  name: CombatChooseActionStateNames = ChooseUsableItem.NAME;
  /** Already selected items are excluded from item list */
  selectedItems: Item[] = [];

  async enter(machine: ChooseActionStateMachine) {
    assertTrue(machine.current, 'invalid player');
    assertTrue(machine.parent.machine, 'invalid combat state machine');
    const parent = machine.parent.machine;
    const selectItem = (item: Item) => {
      machine.item = item;
      machine.target = machine.current;
      machine.setCurrentState(ChooseActionTarget.NAME);
      // Note item as selected (to avoid 2 players choosing the same item)
      this.selectedItems.push(item);
    };
    machine.parent.items = parent.items
      // Exclude already selected items for use
      .filter((a: Item) => !this.selectedItems.find((b) => a.eid === b.eid))
      .toJS()
      .map((a: Item) => {
        return {
          select: selectItem.bind(this, a),
          label: a.name,
        };
      });
  }

  async exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}

/**
 * Choose a target to apply a combat action to
 */
export class ChooseActionTarget extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'choose-target';
  name: CombatChooseActionStateNames = ChooseActionTarget.NAME;

  async enter(machine: ChooseActionStateMachine) {
    const enemies: GameEntityObject[] = machine.enemies;
    const p: GameEntityObject = machine.target || enemies[0];
    assertTrue(p, 'no enemies for targetting');
    machine.parent.pointerClass = machine.action?.name || '';
    const combat = machine.parent.machine;
    assertTrue(combat, 'invalid link to combat state machine');
    let sub: Subscription | null = null;
    const selectTarget = (target: GameEntityObject) => {
      if (machine.target && machine.target._uid === target._uid) {
        machine.target = target;
        sub?.unsubscribe();
        sub = null;
        machine.setCurrentState(ChooseActionSubmit.NAME);
        return;
      }
      machine.target = target;
      machine.parent.setPointerTarget(target, 'left');
    };
    const clickTarget = (click: CombatSceneClick) => {
      selectTarget(click.hits[0]);
    };

    const beneficial: boolean = !!(machine.spell?.benefit || machine.item);
    const targets: GameEntityObject[] = beneficial ? machine.players : machine.enemies;
    machine.parent.items = targets.map((a: GameEntityObject) => {
      return {
        select: selectTarget.bind(this, a),
        label: `${a.model?.name}`,
        source: a,
        id: `${a.model?.eid}`,
      };
    });

    machine.parent.setPointerTarget(p, 'left');
    sub = combat.onClick$.subscribe((c) => clickTarget(c));
  }

  async exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}

/**
 * Submit a selected action type and action target to the submit handler
 * implementation.
 */
export class ChooseActionSubmit extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'submit-choice';
  name: CombatChooseActionStateNames = ChooseActionSubmit.NAME;

  constructor(public submit: (action: CombatActionBehavior) => any) {
    super();
  }

  async enter(machine: ChooseActionStateMachine) {
    const player = machine.current as CombatPlayerComponent;
    assertTrue(player, 'invalid player');
    assertTrue(machine.action, 'invalid action');
    assertTrue(!machine.action.canTarget() || machine.target, 'invalid target');
    await player.moveBackward();
    machine.parent.pointer = false;
    machine.action.from = machine.current;
    machine.action.to = machine.target;
    machine.action.spell = machine.spell;
    machine.action.item = machine.item;
    machine.parent.pointerClass = '';
    this.submit(machine.action);
  }
}

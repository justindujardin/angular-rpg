import * as Immutable from 'immutable';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { Point } from '../../../../app/core/point';
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
import {
  CombatChooseActionStateComponent,
  IChooseActionEvent,
} from '../states/combat-choose-action.state';

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
  player: CombatPlayerComponent | null = null;
  action: CombatActionBehavior | null = null;
  spell: ITemplateMagic | null = null;
  item: Item | null = null;
  world: GameWorld | null = GameWorld.get();

  constructor(
    public parent: CombatChooseActionStateComponent,
    public scene: Scene,
    public data: IChooseActionEvent,
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

  enter(machine: ChooseActionStateMachine) {
    const combat = machine.parent.machine;
    assertTrue(combat, 'invalid link to combat state machine');
    let sub: Subscription | null = null;

    let clickSelect = (click: CombatSceneClick) => {
      sub?.unsubscribe();
      sub = null;
      machine.target = click.hits[0];
      machine.parent.items[0].select();
    };
    if (!machine.current) {
      throw new Error('Requires Current Player');
    }
    const p: CombatPlayerComponent = machine.current as CombatPlayerComponent;
    machine.player = p;
    if (!machine.player) {
      throw new Error('Requires player render component for combat animations.');
    }
    machine.parent.pointerOffset = new Point(-1, -0.25);
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

    const items = _.filter(
      p.findBehaviors(CombatActionBehavior),
      (c: CombatActionBehavior) => c.canBeUsedBy(p)
    );
    machine.parent.items = _.map(items, (a: CombatActionBehavior) => {
      return {
        select: selectAction.bind(this, a),
        label: a.getActionName(),
        id: a._uid,
      };
    });

    // No pointer target
    if (!p) {
      machine.parent.hidePointer();
      return;
    }

    machine.player.moveForward(() => {
      machine.parent.setPointerTarget(p, 'right');
      machine.parent.showPointer();
      sub = combat.onClick$.subscribe(clickSelect);
    });
  }

  exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}
/**
 * Choose a magic spell to cast in combat.
 */
export class ChooseMagicSpell extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'choose-spell';
  name: CombatChooseActionStateNames = ChooseMagicSpell.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current) {
      throw new Error('Requires Current Player');
    }

    const combat = machine.parent.machine;
    assertTrue(combat, 'invalid link to combat state machine');
    let sub: Subscription | null = null;

    const clickSelect = (click: CombatSceneClick) => {
      sub?.unsubscribe();
      sub = null;
      machine.target = click.hits[0];
      machine.parent.items[0].select();
    };
    const selectSpell = (spell: ITemplateMagic) => {
      sub?.unsubscribe();
      sub = null;
      machine.spell = spell;
      if (spell.benefit) {
        machine.target = machine.current;
      }
      switch (spell.target) {
        case 'target':
          machine.setCurrentState(ChooseActionTarget.NAME);
          break;
        default:
          console.info(`Unknown spell type, submitting without target: ${spell.type}`);
          machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };
    const spells: Immutable.List<ITemplateMagic> =
      machine.parent.machine?.spells || Immutable.List<ITemplateMagic>();
    machine.parent.items = spells
      .map((a: Magic): ICombatMenuItem => {
        return {
          select: selectSpell.bind(this, a),
          label: a.magicname,
          id: a.eid,
        };
      })
      .toList()
      .toJS() as ICombatMenuItem[];
    sub = combat.onClick$.subscribe(clickSelect);
  }

  exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}
/**
 * Choose an item to use in combat.
 */
export class ChooseUsableItem extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'choose-item';
  name: CombatChooseActionStateNames = ChooseUsableItem.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current || !machine.parent?.machine) {
      throw new Error('Requires Current Player and parent machine');
    }
    const parent = machine.parent.machine;
    const selectItem = (item: Item) => {
      machine.item = item;
      machine.target = machine.current;
      machine.setCurrentState(ChooseActionTarget.NAME);
    };
    machine.parent.items = parent.items
      .map((a: Item) => {
        return {
          select: selectItem.bind(this, a),
          label: a.name,
        };
      })
      .toList()
      .toJS() as ICombatMenuItem[];
  }

  exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}

/**
 * Choose a target to apply a combat action to
 */
export class ChooseActionTarget extends State<CombatChooseActionStateNames> {
  static NAME: CombatChooseActionStateNames = 'choose-target';
  name: CombatChooseActionStateNames = ChooseActionTarget.NAME;

  enter(machine: ChooseActionStateMachine) {
    const enemies: GameEntityObject[] = machine.data.enemies;
    const p: GameEntityObject = machine.target || enemies[0];
    machine.parent.addPointerClass(machine.action?.getActionName() || '');
    if (!p) {
      machine.parent.hidePointer();
      return;
    }
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

    const beneficial: boolean = !!(
      machine &&
      ((machine.spell && machine.spell.benefit) || machine.item)
    );
    const targets: GameEntityObject[] = beneficial
      ? machine.data.players
      : machine.data.enemies;
    machine.parent.items = _.map(targets, (a: GameEntityObject) => {
      return {
        select: selectTarget.bind(this, a),
        label: a.model?.name || '',
        source: a,
        id: a.model?.eid || '',
      };
    });

    machine.parent.pointerOffset = new Point(0.5, -0.25);
    machine.parent.setPointerTarget(p, 'left');
    sub = combat.onClick$.subscribe((c) => clickTarget(c));
  }

  exit(machine: ChooseActionStateMachine) {
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

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current || !machine.action || !this.submit) {
      throw new Error('Invalid state');
    }
    if (machine.action.canTarget() && !machine.target) {
      throw new Error('Invalid target');
    }
    machine.player?.moveBackward(() => {
      machine.parent.hidePointer();
      assertTrue(machine.action, 'invalid choose action!');
      machine.action.from = machine.current;
      machine.action.to = machine.target;
      machine.action.spell = machine.spell;
      machine.action.item = machine.item;
      machine.action.select();
      machine.parent.removePointerClass(machine.action.getActionName());
      this.submit(machine.action);
    });
  }
}

import * as _ from 'underscore';
import {GameEntityObject} from '../../../scene/game-entity-object';
import {Point} from '../../../../game/pow-core/point';
import {StateMachine} from '../../../../game/pow2/core/state-machine';
import {Scene} from '../../../../game/pow2/scene/scene';
import {CombatActionBehavior} from '../behaviors/combat-action.behavior';
import {UsableModel} from '../../../../game/rpg/models/usableModel';
import {GameWorld} from '../../../services/game-world';
import {State} from '../../../../game/pow2/core/state';
import {CombatPlayerRenderBehaviorComponent} from '../behaviors/combat-player-render.behavior';
// import {CombatItemBehavior} from '../behaviors/actions/combat-item.behavior';
// import {CombatMagicBehavior} from '../behaviors/actions/combat-magic.behavior';
import {IChooseActionEvent, CombatChooseActionStateComponent} from '../states/combat-choose-action.state';
import {IPlayerAction} from '../states/combat.machine';
import {ElementRef} from '@angular/core';
import {CombatPlayerComponent} from '../combat-player.entity';
import {Item} from '../../../models/item';
import {ITemplateMagic} from '../../../models/game-data/game-data.model';

/**
 * Attach an HTML element to the position of a game object.
 */
export interface UIAttachment {
  object: GameEntityObject;
  offset: Point;
  element: ElementRef;
}

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
export class ChooseActionStateMachine extends StateMachine {
  current: GameEntityObject = null;
  target: GameEntityObject = null;
  player: CombatPlayerRenderBehaviorComponent = null;
  action: CombatActionBehavior = null;
  spell: ITemplateMagic = null;
  item: Item = null;
  world: GameWorld = GameWorld.get();

  constructor(public parent: CombatChooseActionStateComponent,
              public scene: Scene,
              public data: IChooseActionEvent,
              submit: (action: CombatActionBehavior) => any) {
    super();
    this.states = [
      new ChooseActionTarget(),
      new ChooseActionType(),
      new ChooseUsableItem(),
      new ChooseMagicSpell(),
      new ChooseActionSubmit(submit)
    ];

  }
}

/**
 * Choose a specific action type to apply in combat.
 */
export class ChooseActionType extends State {
  static NAME: string = 'choose-type';
  name: string = ChooseActionType.NAME;

  enter(machine: ChooseActionStateMachine) {
    let clickSelect = (mouse: any, hits: any) => {
      machine.scene.off('click', clickSelect);
      machine.target = hits[0];
      machine.parent.items[0].select();
    };
    if (!machine.current) {
      throw new Error('Requires Current Player');
    }
    const p: CombatPlayerComponent = machine.current as CombatPlayerComponent;
    machine.player = p.render;
    if (!machine.player) {
      throw new Error('Requires player render component for combat animations.');
    }
    let pointerOffset: Point = new Point(-1, -0.25);
    machine.action = machine.target = machine.spell = machine.item = null;

    // Enable menu selection of action type.
    const selectAction = (action: IPlayerAction) => {
      machine.action = action as CombatActionBehavior;
      machine.scene.off('click', clickSelect);

      // if (machine.action instanceof CombatMagicBehavior) {
      //   if (machine.current.getSpells().length === 1) {
      //     machine.spell = machine.current.getSpells()[0];
      //     machine.setCurrentState(ChooseActionTarget.NAME);
      //   }
      //   else {
      //     machine.setCurrentState(ChooseMagicSpell.NAME);
      //   }
      // }
      // else if (machine.action instanceof CombatItemBehavior) {
      //   machine.setCurrentState(ChooseUsableItem.NAME);
      // }
      // else
      if (machine.action.canTarget()) {
        machine.setCurrentState(ChooseActionTarget.NAME);
      }
      else {
        machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };

    const items = _.filter(p.findBehaviors(CombatActionBehavior), (c: CombatActionBehavior) => c.canBeUsedBy(p));
    machine.parent.items = _.map(items, (a: CombatActionBehavior) => {
      return {
        select: selectAction.bind(this, a),
        label: a.getActionName()
      };
    });

    // No pointer target
    if (!p) {
      machine.parent.hidePointer();
      return;
    }

    machine.player.moveForward(() => {
      machine.parent.setPointerTarget(p, 'right', pointerOffset);
      machine.parent.showPointer();
      machine.scene.on('click', clickSelect);
    });
  }

  exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}
/**
 * Choose a magic spell to cast in combat.
 */
export class ChooseMagicSpell extends State {
  static NAME: string = 'choose-spell';
  name: string = ChooseMagicSpell.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current) {
      throw new Error('Requires Current Player');
    }

    const clickSelect = (mouse: any, hits: any) => {
      machine.scene.off('click', clickSelect);
      machine.target = hits[0];
      machine.parent.items[0].select();
    };
    const selectSpell = (spell: ITemplateMagic) => {
      machine.scene.off('click', clickSelect);
      machine.spell = spell;
      if (spell.benefit) {
        machine.target = machine.current;
      }
      switch (spell.type) {
        case 'target':
          machine.setCurrentState(ChooseActionTarget.NAME);
          break;
        default:
          console.info(`Unknown spell type, submitting without target: ${spell.type}`);
          machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };
    const spells: any = machine.current.getSpells();
    machine.parent.items = _.map(spells, (a: any) => {
      return {
        select: selectSpell.bind(this, a),
        label: a.name
      };
    });
    machine.scene.on('click', clickSelect);
  }

  exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}
/**
 * Choose an item to use in combat.
 */
export class ChooseUsableItem extends State {
  static NAME: string = 'choose-item';
  name: string = ChooseUsableItem.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current) {
      throw new Error('Requires Current Player');
    }
    const selectItem = (item: Item) => {
      machine.item = item;
      machine.target = machine.current;
      machine.setCurrentState(ChooseActionTarget.NAME);
    };
    console.warn('todo: combat items');
    // var items: any = machine.current.world.model.inventory;
    // machine.parent.items = _.map(items, (a: Item) => {
    //   return <any>{
    //     select: selectItem.bind(this, a),
    //     label: a.name
    //   };
    // });
  }

  exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}

/**
 * Choose a target to apply a combat action to
 */
export class ChooseActionTarget extends State {
  static NAME: string = 'choose-target';
  name: string = ChooseActionTarget.NAME;

  enter(machine: ChooseActionStateMachine) {
    const enemies: GameEntityObject[] = machine.data.enemies;

    const p: GameEntityObject = machine.target || enemies[0];
    machine.parent.addPointerClass(machine.action.getActionName());
    if (!p) {
      machine.parent.hidePointer();
      return;
    }
    let clickTarget;
    const pointerOffset: Point = new Point(0.5, -0.25);
    const selectTarget = (target: GameEntityObject) => {
      if (machine.target && machine.target._uid === target._uid) {
        machine.target = target;
        machine.scene.off('click', clickTarget);
        machine.setCurrentState(ChooseActionSubmit.NAME);
        return;
      }
      machine.target = target;
      machine.parent.setPointerTarget(target, 'left', pointerOffset);
    };
    clickTarget = (mouse: any, hits: GameEntityObject[]) => {
      selectTarget(hits[0]);
    };

    const beneficial: boolean = !!(machine && ((machine.spell && machine.spell.benefit) || machine.item));
    const targets: GameEntityObject[] = beneficial ? machine.data.players : machine.data.enemies;
    machine.parent.items = _.map(targets, (a: GameEntityObject) => {
      return {
        select: selectTarget.bind(this, a),
        label: a.model.name
      };
    });

    machine.parent.setPointerTarget(p, 'left', pointerOffset);
    machine.scene.on('click', clickTarget);
  }

  exit(machine: ChooseActionStateMachine) {
    machine.parent.items = [];
  }
}

/**
 * Submit a selected action type and action target to the submit handler
 * implementation.
 */
export class ChooseActionSubmit extends State {
  static NAME: string = 'choose-submit';
  name: string = ChooseActionSubmit.NAME;

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
    machine.player.moveBackward(() => {
      machine.parent.hidePointer();
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

import * as _ from 'underscore';
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {Point} from '../../../../game/pow-core/point';
import {StateMachine} from '../../../../game/pow2/core/stateMachine';
import {Scene} from '../../../../game/pow2/scene/scene';
import {CombatActionBehavior} from '../behaviors/combat-action.behavior';
import {IGameSpell} from '../../../../game/rpg/game';
import {UsableModel} from '../../../../game/rpg/models/usableModel';
import {GameWorld} from '../../../services/gameWorld';
import {CombatComponent} from '../combat.component';
import {State} from '../../../../game/pow2/core/state';
import {IPlayerAction} from '../playerCombatState';
import {CombatPlayerRenderBehavior} from '../behaviors/combat-player-render.behavior';
import {CombatItemBehavior} from '../behaviors/actions/combat-item.behavior';
import {CombatMagicBehavior} from '../behaviors/actions/combat-magic.behavior';
import {IChooseActionEvent} from '../states/combat-choose-action.state';

/**
 * Attach an HTML element to the position of a game object.
 */
export interface UIAttachment {
  object: GameEntityObject;
  offset: Point;
  element: any;
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
  player: CombatPlayerRenderBehavior = null;
  action: CombatActionBehavior = null;
  spell: IGameSpell = null;
  item: UsableModel = null;
  world: GameWorld = GameWorld.get();

  constructor(public combatComponent: CombatComponent,
              public scene: Scene,
              public data: IChooseActionEvent,
              submit: (action: CombatActionBehavior)=>any) {
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
  static NAME: string = "choose-type";
  name: string = ChooseActionType.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.combatComponent || !machine.combatComponent.pointer) {
      throw new Error("Requires UIAttachment");
    }
    if (!machine.current) {
      throw new Error("Requires Current Player");
    }
    var p: GameEntityObject = machine.current;
    machine.player = p.findBehavior(CombatPlayerRenderBehavior) as CombatPlayerRenderBehavior;
    if (!machine.player) {
      throw new Error("Requires player render component for combat animations.");
    }
    var pointerOffset: Point = new Point(-1, -0.25);
    machine.action = machine.target = machine.spell = machine.item = null;

    // Enable menu selection of action type.
    var selectAction = (action: IPlayerAction) => {
      machine.action = action as CombatActionBehavior;
      machine.scene.off('click', clickSelect);

      if (machine.action instanceof CombatMagicBehavior) {
        if (machine.current.getSpells().length === 1) {
          machine.spell = machine.current.getSpells()[0];
          machine.setCurrentState(ChooseActionTarget.NAME);
        }
        else {
          machine.setCurrentState(ChooseMagicSpell.NAME);
        }
      }
      else if (machine.action instanceof CombatItemBehavior) {
        machine.setCurrentState(ChooseUsableItem.NAME);
      }
      else if (machine.action.canTarget()) {
        machine.setCurrentState(ChooseActionTarget.NAME);
      }
      else {
        machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };

    var items = _.filter(p.findBehaviors(CombatActionBehavior), (c: CombatActionBehavior)=> c.canBeUsedBy(p));
    machine.combatComponent.items = _.map(items, (a: CombatActionBehavior) => {
      return <any>{
        select: selectAction.bind(this, a),
        label: a.getActionName()
      };
    });

    // TODO: Eradicate JQuery
    var el: any = jQuery(machine.combatComponent.pointer.element);
    if (!p) {
      el.hide();
      return;
    }
    var clickSelect = (mouse: any, hits: any) => {
      machine.scene.off('click', clickSelect);
      machine.target = hits[0];
      machine.combatComponent.items[0].select();
    };
    machine.player.moveForward(() => {
      machine.combatComponent.setPointerTarget(p, "right", pointerOffset);
      el.show();
      machine.scene.on('click', clickSelect);
    });
  }

  exit(machine: ChooseActionStateMachine) {
    machine.combatComponent.items = [];
  }
}
/**
 * Choose a magic spell to cast in combat.
 */
export class ChooseMagicSpell extends State {
  static NAME: string = "choose-spell";
  name: string = ChooseMagicSpell.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current) {
      throw new Error("Requires Current Player");
    }
    var selectSpell = (spell: IGameSpell) => {
      machine.scene.off('click', clickSelect);
      machine.spell = spell;
      if (spell.benefit) {
        machine.target = machine.current;
      }
      switch (spell.type) {
        case "target":
          machine.setCurrentState(ChooseActionTarget.NAME);
          break;
        default:
          console.info("Unknown spell type, submitting without target: " + spell.type);
          machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };
    var spells: any = machine.current.getSpells();
    machine.combatComponent.items = _.map(spells, (a: any) => {
      return <any>{
        select: selectSpell.bind(this, a),
        label: a.name
      };
    });

    var clickSelect = (mouse: any, hits: any) => {
      machine.scene.off('click', clickSelect);
      machine.target = hits[0];
      machine.combatComponent.items[0].select();
    };
    machine.scene.on('click', clickSelect);
  }

  exit(machine: ChooseActionStateMachine) {
    machine.combatComponent.items = [];
  }
}
/**
 * Choose an item to use in combat.
 */
export class ChooseUsableItem extends State {
  static NAME: string = "choose-item";
  name: string = ChooseUsableItem.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current) {
      throw new Error("Requires Current Player");
    }
    var selectItem = (item: UsableModel) => {
      machine.item = item;
      machine.target = machine.current;
      machine.setCurrentState(ChooseActionTarget.NAME);
    };
    var items: any = machine.current.world.model.inventory;
    machine.combatComponent.items = _.map(items, (a: UsableModel) => {
      return <any>{
        select: selectItem.bind(this, a),
        label: a.get('name')
      };
    });
  }

  exit(machine: ChooseActionStateMachine) {
    machine.combatComponent.items = [];
  }
}

/**
 * Choose a target to apply a combat action to
 */
export class ChooseActionTarget extends State {
  static NAME: string = "choose-target";
  name: string = ChooseActionTarget.NAME;

  enter(machine: ChooseActionStateMachine) {
    if (!machine.combatComponent || !machine.combatComponent.pointer) {
      throw new Error("Requires UIAttachment");
    }
    var enemies = <GameEntityObject[]>machine.data.enemies;

    var p: GameEntityObject = machine.target || enemies[0];
    var el: any = jQuery(machine.combatComponent.pointer.element);
    machine.combatComponent.addPointerClass(machine.action.getActionName());
    if (!p) {
      el.hide();
      return;
    }
    var selectTarget = (target: GameEntityObject) => {
      if (machine.target && machine.target._uid === target._uid) {
        machine.target = target;
        machine.scene.off('click', clickTarget);
        machine.setCurrentState(ChooseActionSubmit.NAME);
        return;
      }
      machine.target = target;
      machine.combatComponent.setPointerTarget(target, "left", pointerOffset);
    };

    const beneficial: boolean = !!(machine && ((machine.spell && machine.spell.benefit) || machine.item));
    const targets: GameEntityObject[] = beneficial ? machine.data.players : machine.data.enemies;
    machine.combatComponent.items = _.map(targets, (a: GameEntityObject) => {
      return <any>{
        select: selectTarget.bind(this, a),
        label: a.model.name
      };
    });

    var pointerOffset: Point = new Point(0.5, -0.25);
    var clickTarget = (mouse: any, hits: GameEntityObject[]) => {
      selectTarget(hits[0]);
    };
    machine.combatComponent.setPointerTarget(p, "left", pointerOffset);
    machine.scene.on('click', clickTarget);
  }

  exit(machine: ChooseActionStateMachine) {
    machine.combatComponent.items = [];
  }
}

/**
 * Submit a selected action type and action target to the submit handler
 * implementation.
 */
export class ChooseActionSubmit extends State {
  static NAME: string = "choose-submit";
  name: string = ChooseActionSubmit.NAME;

  constructor(public submit: (action: CombatActionBehavior)=>any) {
    super();
  }

  enter(machine: ChooseActionStateMachine) {
    if (!machine.current || !machine.action || !this.submit) {
      throw new Error("Invalid state");
    }
    if (machine.action.canTarget() && !machine.target) {
      throw new Error("Invalid target");
    }
    machine.player.moveBackward(()=> {
      if (machine.combatComponent.pointer) {
        jQuery(machine.combatComponent.pointer.element).hide();
      }
      machine.action.from = machine.current;
      machine.action.to = machine.target;
      machine.action.spell = machine.spell;
      machine.action.item = machine.item;
      machine.action.select();
      machine.combatComponent.removePointerClass(machine.action.getActionName());
      this.submit(machine.action);
    });
  }
}

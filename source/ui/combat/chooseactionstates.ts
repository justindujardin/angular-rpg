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

import {GameEntityObject} from '../../objects/all';
import {GameWorld} from '../../gameWorld';
import {CombatMap} from './combatmap';
import {IPlayerAction} from '../../states/playerCombatState';
import {IChooseActionEvent} from '../../states/combat/combatChooseActionState';
import {CombatActionComponent} from '../../components/combat/combatActionComponent';
import {CombatMagicComponent} from '../../components/combat/actions/combatMagicComponent';

/**
 * Attach an HTML element to the position of a game object.
 */
export interface UIAttachment {
  object:GameEntityObject;
  offset:pow2.Point;
  element:HTMLElement;
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
export class ChooseActionStateMachine extends pow2.StateMachine {
  current:GameEntityObject = null;
  target:GameEntityObject = null;
  scene:pow2.scene.Scene;
  player:pow2.game.components.PlayerCombatRenderComponent = null;
  action:CombatActionComponent = null;
  spell:any = null;
  world:GameWorld = GameWorld.get();

  constructor(public controller:CombatMap,
              public data:IChooseActionEvent,
              submit:(action:CombatActionComponent)=>any) {
    super();
    this.scene = controller.combat.scene;
    this.states = [
      new ChooseActionTarget(),
      new ChooseActionType(),
      new ChooseMagicSpell(),
      new ChooseActionSubmit(submit)
    ];

  }
}

/**
 * Choose a specific action type to apply in combat.
 */
export class ChooseActionType extends pow2.State {
  static NAME:string = "choose-type";
  name:string = ChooseActionType.NAME;

  enter(machine:ChooseActionStateMachine) {
    if (!machine.controller || !machine.controller.pointer) {
      throw new Error("Requires UIAttachment");
    }
    if (!machine.current) {
      throw new Error("Requires Current Player");
    }
    var p:GameEntityObject = machine.current;
    machine.player = <pow2.game.components.PlayerCombatRenderComponent>
      p.findComponent(pow2.game.components.PlayerCombatRenderComponent);
    if (!machine.player) {
      throw new Error("Requires player render component for combat animations.");
    }
    var pointerOffset:pow2.Point = new pow2.Point(-1, -0.25);
    machine.action = null;
    machine.target = null;

    // Enable menu selection of action type.
    var selectAction = (action:IPlayerAction) => {
      machine.action = <CombatActionComponent>action;

      machine.controller.selectAction = null;
      machine.scene.off('click', clickSelect);

      if (machine.action instanceof CombatMagicComponent) {
        if (machine.current.getSpells().length === 1) {
          machine.spell = machine.current.getSpells()[0];
          machine.setCurrentState(ChooseActionTarget.NAME);
        }
        else {
          machine.setCurrentState(ChooseMagicSpell.NAME);
        }
      }
      else if (machine.action.canTarget()) {
        machine.setCurrentState(ChooseActionTarget.NAME);
      }
      else {
        machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };
    machine.controller.selectAction = selectAction;

    var el:JQuery = $(machine.controller.pointer.element);
    if (!p) {
      el.hide();
      return;
    }
    machine.controller.choosing = p;

    var clickSelect = (mouse:any, hits:any) => {
      machine.scene.off('click', clickSelect);
      machine.target = hits[0];
      selectAction(machine.controller.getActions()[0]);
    };
    machine.player.moveForward(() => {
      machine.controller.setPointerTarget(p, "right", pointerOffset);
      el.show();
      machine.scene.on('click', clickSelect);
    });
  }

  exit(machine:ChooseActionStateMachine) {
    machine.controller.choosing = null;
  }
}
/**
 * Choose a magic spell to cast in combat.
 */
export class ChooseMagicSpell extends pow2.State {
  static NAME:string = "choose-spell";
  name:string = ChooseMagicSpell.NAME;

  enter(machine:ChooseActionStateMachine) {
    if (!machine.current) {
      throw new Error("Requires Current Player");
    }
    // Enable menu selection of action type.
    machine.controller.selectSpell = (spell:any) => {//TODO: spell type
      machine.spell = spell;
      machine.controller.selectSpell = null;
      machine.target = spell.benefit ? machine.current : null;
      switch (spell.type) {
        case "target":
          machine.setCurrentState(ChooseActionTarget.NAME);
          break;
        default:
          console.info("Unknown spell type, submitting without target: " + spell.type);
          machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };
    machine.controller.choosingSpell = machine.player;
  }

  exit(machine:ChooseActionStateMachine) {
    machine.controller.choosingSpell = null;
  }
}

/**
 * Choose a target to apply a combat action to
 */
export class ChooseActionTarget extends pow2.State {
  static NAME:string = "choose-target";
  name:string = ChooseActionTarget.NAME;

  enter(machine:ChooseActionStateMachine) {
    if (!machine.controller || !machine.controller.pointer) {
      throw new Error("Requires UIAttachment");
    }
    var enemies = <GameEntityObject[]>machine.data.enemies;

    var p:GameEntityObject = machine.target || enemies[0];
    var el:JQuery = $(machine.controller.pointer.element);
    machine.controller.addPointerClass(machine.action.getActionName());
    if (!p) {
      el.hide();
      return;
    }
    var selectTarget = (target:GameEntityObject) => {
      if (machine.target && machine.target._uid === target._uid) {
        machine.target = target;
        machine.controller.selectTarget = null;
        machine.scene.off('click', clickTarget);
        machine.setCurrentState(ChooseActionSubmit.NAME);
        machine.controller.targeting = false;
        return;
      }
      machine.target = target;
      machine.controller.setPointerTarget(target, "left", pointerOffset);
    };
    machine.controller.selectTarget = selectTarget;

    var pointerOffset:pow2.Point = new pow2.Point(0.5, -0.25);
    var clickTarget = (mouse:any, hits:GameEntityObject[]) => {
      selectTarget(hits[0]);
    };
    machine.controller.setPointerTarget(p, "left", pointerOffset);
    machine.scene.on('click', clickTarget);
    machine.controller.targeting = true;
  }

  exit(machine:ChooseActionStateMachine) {
    machine.controller.targeting = false;
  }
}

/**
 * Submit a selected action type and action target to the submit handler
 * implementation.
 */
export class ChooseActionSubmit extends pow2.State {
  static NAME:string = "choose-submit";
  name:string = ChooseActionSubmit.NAME;

  constructor(public submit:(action:CombatActionComponent)=>any) {
    super();
  }

  enter(machine:ChooseActionStateMachine) {
    if (!machine.current || !machine.action || !this.submit) {
      throw new Error("Invalid state");
    }
    if (machine.action.canTarget() && !machine.target) {
      throw new Error("Invalid target");
    }
    machine.player.moveBackward(()=> {
      if (machine.controller.pointer) {
        $(machine.controller.pointer.element).hide();
      }
      machine.action.from = machine.current;
      machine.action.to = machine.target;
      machine.action.spell = machine.spell;
      machine.action.select();
      machine.controller.removePointerClass(machine.action.getActionName());
      this.submit(machine.action);
    });
  }
}

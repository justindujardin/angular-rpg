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

import * as rpg from '../../game';
import {GameEntityObject} from '../../objects/all';
import {GameWorld} from '../../gameWorld';
import {CombatMap} from './combatmap';
import {IPlayerAction} from '../../states/playerCombatState';
import {IChooseActionEvent} from '../../states/combat/combatChooseActionState';
import {CombatMagicComponent,CombatActionComponent,CombatItemComponent} from '../../components/combat/actions/all';
import {UsableModel} from '../../models/all';

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
  spell:rpg.IGameSpell = null;
  item:UsableModel = null;
  world:GameWorld = GameWorld.get();

  constructor(public map:CombatMap,
              public data:IChooseActionEvent,
              submit:(action:CombatActionComponent)=>any) {
    super();
    this.scene = map.combat.scene;
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
export class ChooseActionType extends pow2.State {
  static NAME:string = "choose-type";
  name:string = ChooseActionType.NAME;

  enter(machine:ChooseActionStateMachine) {
    if (!machine.map || !machine.map.pointer) {
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
    machine.action = machine.target = machine.spell = machine.item = null;

    // Enable menu selection of action type.
    var selectAction = (action:IPlayerAction) => {
      machine.action = <CombatActionComponent>action;
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
      else if (machine.action instanceof CombatItemComponent) {
        machine.setCurrentState(ChooseUsableItem.NAME);
      }
      else if (machine.action.canTarget()) {
        machine.setCurrentState(ChooseActionTarget.NAME);
      }
      else {
        machine.setCurrentState(ChooseActionSubmit.NAME);
      }
    };

    var items = _.filter(p.findComponents(CombatActionComponent), (c:CombatActionComponent)=> c.canBeUsedBy(p));
    machine.map.items = _.map(items, (a:CombatActionComponent) => {
      return <any>{
        select: selectAction.bind(this, a),
        label: a.getActionName()
      };
    });

    // TODO: Eradicate JQuery
    var el:JQuery = $(machine.map.pointer.element);
    if (!p) {
      el.hide();
      return;
    }
    var clickSelect = (mouse:any, hits:any) => {
      machine.scene.off('click', clickSelect);
      machine.target = hits[0];
      machine.map.items[0].select();
    };
    machine.player.moveForward(() => {
      machine.map.setPointerTarget(p, "right", pointerOffset);
      el.show();
      machine.scene.on('click', clickSelect);
    });
  }

  exit(machine:ChooseActionStateMachine) {
    machine.map.items = [];
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
    var selectSpell = (spell:rpg.IGameSpell) => {
      machine.scene.off('click', clickSelect);
      machine.spell = spell;
      if(spell.benefit){
        machine.target =  machine.current;
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
    var spells:any = machine.current.getSpells();
    machine.map.items = _.map(spells, (a:any) => {
      return <any>{
        select: selectSpell.bind(this, a),
        label: a.name
      };
    });

    var clickSelect = (mouse:any, hits:any) => {
      machine.scene.off('click', clickSelect);
      machine.target = hits[0];
      machine.map.items[0].select();
    };
    machine.scene.on('click', clickSelect);
  }

  exit(machine:ChooseActionStateMachine) {
    machine.map.items = [];
  }
}
/**
 * Choose an item to use in combat.
 */
export class ChooseUsableItem extends pow2.State {
  static NAME:string = "choose-item";
  name:string = ChooseUsableItem.NAME;

  enter(machine:ChooseActionStateMachine) {
    if (!machine.current) {
      throw new Error("Requires Current Player");
    }
    var selectItem = (item:UsableModel) => {
      machine.item = item;
      machine.target = machine.current;
      machine.setCurrentState(ChooseActionTarget.NAME);
    };
    var items:any = machine.current.world.model.inventory;
    machine.map.items = _.map(items, (a:UsableModel) => {
      return <any>{
        select: selectItem.bind(this, a),
        label: a.get('name')
      };
    });
  }

  exit(machine:ChooseActionStateMachine) {
    machine.map.items = [];
  }
}

/**
 * Choose a target to apply a combat action to
 */
export class ChooseActionTarget extends pow2.State {
  static NAME:string = "choose-target";
  name:string = ChooseActionTarget.NAME;

  enter(machine:ChooseActionStateMachine) {
    if (!machine.map || !machine.map.pointer) {
      throw new Error("Requires UIAttachment");
    }
    var enemies = <GameEntityObject[]>machine.data.enemies;

    var p:GameEntityObject = machine.target || enemies[0];
    var el:JQuery = $(machine.map.pointer.element);
    machine.map.addPointerClass(machine.action.getActionName());
    if (!p) {
      el.hide();
      return;
    }
    var selectTarget = (target:GameEntityObject) => {
      if (machine.target && machine.target._uid === target._uid) {
        machine.target = target;
        machine.scene.off('click', clickTarget);
        machine.setCurrentState(ChooseActionSubmit.NAME);
        return;
      }
      machine.target = target;
      machine.map.setPointerTarget(target, "left", pointerOffset);
    };

    var beneficial:boolean = !!(machine && ((machine.spell && machine.spell.benefit) || machine.item));
    var targets:GameEntityObject[] = beneficial ? machine.data.players : machine.data.enemies;
    machine.map.items = _.map(targets, (a:GameEntityObject) => {
      return <any>{
        select: selectTarget.bind(this, a),
        label: a.model.attributes.name
      };
    });

    var pointerOffset:pow2.Point = new pow2.Point(0.5, -0.25);
    var clickTarget = (mouse:any, hits:GameEntityObject[]) => {
      selectTarget(hits[0]);
    };
    machine.map.setPointerTarget(p, "left", pointerOffset);
    machine.scene.on('click', clickTarget);
  }

  exit(machine:ChooseActionStateMachine) {
    machine.map.items = [];
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
      if (machine.map.pointer) {
        $(machine.map.pointer.element).hide();
      }
      machine.action.from = machine.current;
      machine.action.to = machine.target;
      machine.action.spell = machine.spell;
      machine.action.item = machine.item;
      machine.action.select();
      machine.map.removePointerClass(machine.action.getActionName());
      this.submit(machine.action);
    });
  }
}

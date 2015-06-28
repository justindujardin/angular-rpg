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

/// <reference path="../services/gameService.ts"/>
/// <reference path="./combat/chooseActionStateMachine.ts"/>

module rpg.directives {

  export class CombatViewController implements pow2.IProcessObject {
    static $inject:string[] = ['game', '$scope'];

    constructor(public game:rpg.services.PowGameService,
                public $scope:any) {
      game.world.time.addObject(this);
      $scope.$on('$destroy', ()=> {
        game.world.time.removeObject(this);
      });
    }

    pointer:rpg.directives.combat.UIAttachment = null;
    combatView:GameCombatView = null;
    combatData:rpg.states.combat.IChooseActionEvent = null;
    stateMachine:rpg.directives.combat.ChooseActionStateMachine = null;
    choosing:GameEntityObject = null;
    choosingSpell:pow2.game.components.PlayerCombatRenderComponent = null;
    targeting:boolean = false;

    tick(elapsed:number) {
      if (!this.combatView || !this.pointer || !this.pointer.object) {
        return;
      }
      var targetPos:pow2.Point = this.pointer.object.point.clone();
      targetPos.y = (targetPos.y - this.combatView.camera.point.y) + this.pointer.offset.y;
      targetPos.x = (targetPos.x - this.combatView.camera.point.x) + this.pointer.offset.x;
      var screenPos:pow2.Point = this.combatView.worldToScreen(targetPos, this.combatView.cameraScale);
      var el:JQuery = $(this.pointer.element);
      el.css({
        left: screenPos.x,
        top: screenPos.y
      });
    }

    setPointerTarget(object:GameEntityObject, directionClass:string = "right", offset:pow2.Point = new pow2.Point()) {
      var el:JQuery = $(this.pointer.element);
      el.removeClass('left right');
      el.addClass(directionClass);
      if (this.pointer) {
        this.pointer.object = object;
        this.pointer.offset = offset;
      }
    }

    addPointerClass(clazz:string) {
      $(this.pointer.element).addClass(clazz);
    }

    removePointerClass(clazz:string) {
      $(this.pointer.element).removeClass(clazz);
    }

    destroy() {
      if (this.pointer) {
        $(this.pointer.element).remove();
      }
      this.pointer = null;
    }

    getMemberClass(member, focused):string {
      var result:string[] = [];
      var choosing = this.choosing;
      if (choosing && choosing.model && choosing.model.get('name') === member.model.get('name')) {
        result.push('choosing');
      }
      if (focused && focused.model && member.model.get('name') === focused.model.get('name')) {
        result.push('focused');
      }
      return result.join(' ');
    }

    getActions():rpg.components.combat.CombatActionComponent[] {
      if (!this.choosing) {
        throw new Error("cannot get actions for non-existent game entity");
      }
      var results = _.filter(this.choosing.findComponents(rpg.components.combat.CombatActionComponent), (c:rpg.components.combat.CombatActionComponent)=> {
        return c.canBeUsedBy(this.choosing);
      });
      return results;
    }

    getSpells():any {
      if (!this.choosingSpell || !this.choosingSpell.host) {
        return [];
      }
      var host = <GameEntityObject>this.choosingSpell.host;
      var spells:any = host.getSpells();
      return spells;
    }

    getTargets():GameEntityObject[] {
      var result:GameEntityObject[] = [];
      var beneficial:boolean = this.stateMachine && this.stateMachine.spell && this.stateMachine.spell.benefit;
      if (this.combatData) {
        result = (beneficial ? this.combatData.players : this.combatData.enemies);
      }
      return result;
    }
  }

  app.directive('combatView', ['game', '$compile', '$animate', function (game:rpg.services.PowGameService, $compile, $animate) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'games/rpg/directives/combatView.html',
      controller: CombatViewController,
      controllerAs: "combatCtrl",
      link: (scope, element, attrs, controller:CombatViewController) => {
        controller.destroy();
        var el = $compile('<span class="point-to-player" style="position:absolute;left:0;top:0;"></span>')(scope);
        var chooseTurns = (data:rpg.states.combat.IChooseActionEvent) => {
          controller.combatData = data;
          var combatScene:pow2.scene.Scene = game.world.combatScene;
          if (!combatScene) {
            throw new Error("CombatView requires a combatScene to be present in the game world");
          }
          controller.combatView = combatScene.getViewOfType<GameCombatView>(GameCombatView);
          if (!controller.combatView) {
            throw new Error("CombatView requires a GameCombatView for coordinate conversions");
          }

          var chooseSubmit = (action:rpg.components.combat.CombatActionComponent)=> {
            inputState.data.choose(action);
            next();
          };
          var inputState = new rpg.directives.combat.ChooseActionStateMachine(controller, data, chooseSubmit);
          controller.stateMachine = inputState;
          inputState.data = data;
          var choices:GameEntityObject[] = data.players.slice();
          var next = () => {
            var p:GameEntityObject = choices.shift();
            if (!p) {
              controller.combatData = null;
              controller.stateMachine = null;
              return;
            }
            inputState.current = p;
            inputState.setCurrentState(rpg.directives.combat.ChooseActionType.NAME);
          };

          element.parent().append(el);
          el.show();
          next();
        };
        var turnListener = () => {
          scope.$apply(()=> {
            scope.combat = scope.combat;
          });
        };
        game.machine.on('combat:begin', (state:rpg.states.GameCombatState) => {
          state.machine.on('combat:beginTurn', turnListener);
          state.machine.on('combat:chooseMoves', chooseTurns);
          controller.destroy();
          controller.pointer = {
            element: el[0],
            object: null,
            offset: new pow2.Point(),
            view: controller.combatView
          };
        }, this);
        game.machine.on('combat:end', (state:rpg.states.GameCombatState) => {
          state.machine.off('combat:beginTurn', turnListener);
          state.machine.off('combat:chooseMoves', chooseTurns);
          controller.destroy();
        });
        scope.$on('$destroy', ()=> {
          game.machine && game.machine.off('combat:begin', null, this);
          controller.destroy();
        });
      }
    };
  }]);

}


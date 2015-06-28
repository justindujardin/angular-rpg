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

module rpg.directives {
  app.directive('combatCanvas', [
    '$compile', 'game', '$animate', '$damageValue',
    ($compile, game:rpg.services.PowGameService, $animate:any, $damageValue:pow2.ui.services.DamageValueService) => {
      return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
          $scope.canvas = element[0];
          var context = $scope.canvas.getContext("2d");
          context.webkitImageSmoothingEnabled = false;
          context.mozImageSmoothingEnabled = false;
          window.addEventListener('resize', onResize, false);
          var $window = $(window);

          function onResize() {
            context.canvas.width = $window.width();
            context.canvas.height = $window.height();
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
          }

          var tileView = new GameCombatView(element[0], game.loader);

          // Support showing damage on character with fading animation.
          game.machine.on('enter', function (state) {
            if (state.name !== rpg.states.GameCombatState.NAME) {
              return;
            }
            state.machine.on('combat:attack', (data:rpg.states.combat.CombatAttackSummary) => {
              $damageValue.applyDamage(data.defender, data.damage, tileView);
            });
          });

          game.machine.on('combat:begin', (state:rpg.states.GameCombatState) => {
            // Scope apply?
            // Transition canvas views, and such
            game.world.combatScene.addView(tileView);
            game.tileMap.scene.paused = true;

            tileView.setTileMap(state.tileMap);
            state.machine.on('combat:beginTurn', (player:GameEntityObject) => {
              $scope.$apply(function () {
                $scope.combat = $scope.combat;
              });
            });

          });
          game.machine.on('combat:end', (state:rpg.states.GameCombatState) => {
            game.world.combatScene.removeView(tileView);
            game.tileMap.scene.paused = false;
            state.machine.off('combat:beginTurn', null, this);

          });
          onResize();
        }
      };
    }
  ]);
}
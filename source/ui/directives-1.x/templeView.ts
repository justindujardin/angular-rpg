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
/// <reference path="../services/alertService.ts"/>

module rpg.directives {

// TempleView directive
// ----------------------------------------------------------------------------
  app.directive('templeView', ['game', 'powAlert', function (game:rpg.services.PowGameService, powAlert:rpg.services.PowAlertService) {
    return {
      restrict: 'E',
      templateUrl: 'games/rpg/directives/templeView.html',
      controller: function ($scope) {
        $scope.heal = () => {
          if (!$scope.temple) {
            return;
          }
          var model:rpg.models.GameStateModel = game.world.model;
          var money:number = model.gold;
          var cost:number = parseInt($scope.temple.cost);

          var alreadyHealed:boolean = !_.find(model.party, (hero:rpg.models.HeroModel) => {
            return hero.get('hp') !== hero.get('maxHP');
          });


          if (cost > money) {
            powAlert.show("You don't have enough money");
          }
          else if (alreadyHealed) {
            powAlert.show("Keep your monies.\nYour party is already fully healed.");
          }
          else {
            //console.log("You have (" + money + ") monies.  Spending (" + cost + ") on temple");
            model.gold -= cost;
            _.each(model.party, (hero:rpg.models.HeroModel) => {
              hero.set({hp: hero.get('maxHP')});
            });
            powAlert.show("Your party has been healed! \nYou now have (" + model.gold + ") monies.", null, 2500);

          }
          $scope.temple = null;

        };
        $scope.cancel = () => {
          $scope.temple = null;
        };

      },
      link: function ($scope) {
        game.world.scene.on('temple:entered', function (feature) {
          $scope.$apply(function () {
            $scope.temple = feature;
          });
        });
        game.world.scene.on('temple:exited', function () {
          $scope.$apply(function () {
            $scope.temple = null;
          });
        });
      }
    };
  }]);
}


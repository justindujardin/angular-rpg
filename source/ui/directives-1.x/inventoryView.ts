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
  app.directive('inventoryView', ['game', 'powAlert', function (game:rpg.services.PowGameService, powAlert:rpg.services.PowAlertService) {
    return {
      restrict: 'E',
      templateUrl: '/games/rpg/directives/inventoryView.html',
      controller: function ($scope, $element) {
        var currentIndex:number = 0;
        $scope.character = $scope.party[currentIndex];
        $scope.nextCharacter = () => {
          currentIndex++;
          if (currentIndex >= $scope.party.length) {
            currentIndex = 0;
          }
          $scope.character = $scope.party[currentIndex];
        };
        $scope.previousCharacter = () => {
          currentIndex--;
          if (currentIndex < 0) {
            currentIndex = $scope.party.length - 1;
          }
          $scope.character = $scope.party[currentIndex];
        };
        $scope.equipItem = (item:rpg.models.ItemModel) => {
          var hero:rpg.models.HeroModel = $scope.character;
          if (!$scope.inventory || !item || !hero) {
            return;
          }

          var users = item.get('usedby');
          if (users && _.indexOf(users, hero.get('type')) === -1) {
            powAlert.show(hero.get('name') + " cannot equip this item");
            return;
          }

          if (item instanceof rpg.models.ArmorModel) {
            var old:rpg.models.ArmorModel = hero.equipArmor(item);
            if (old) {
              game.world.model.addInventory(old);
            }
          }
          else if (item instanceof rpg.models.WeaponModel) {
            // Remove any existing weapon first
            if (hero.weapon) {
              game.world.model.addInventory(hero.weapon);
            }
            hero.weapon = <rpg.models.WeaponModel>item;
          }
          game.world.model.removeInventory(item);
          //powAlert.show("Equipped " + item.attributes.name + " to " + hero.attributes.name);
        };

        $scope.unequipItem = (item:rpg.models.ItemModel) => {
          var hero:rpg.models.HeroModel = $scope.character;
          if (!$scope.inventory || !item || !hero) {
            return;
          }
          if (item instanceof rpg.models.ArmorModel) {
            hero.unequipArmor(item);
          }
          else if (item instanceof rpg.models.WeaponModel) {
            var weapon:rpg.models.WeaponModel = <rpg.models.WeaponModel>item;
            if (weapon.isNoWeapon()) {
              return;
            }
            hero.weapon = null;
          }
          game.world.model.addInventory(item);
          //powAlert.show("Unequipped " + item.attributes.name + " from " + hero.attributes.name);
        };
      }
    };
  }]);
}
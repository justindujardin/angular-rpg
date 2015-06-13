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

/// <reference path="../../services/gameService.ts"/>

module rpg.directives.pages {

  export class MainMenuController {
    static $inject:string[] = ['$scope'];

    constructor(public $scope:any) {
      this.$scope.currentClass = "warrior";
      rpg.models.GameStateModel.getDataSource((res:pow2.GameDataResource)=> {
        var data = res.getSheetData('classes');
        this.$scope.classes = data;
        //console.log(JSON.stringify(data,null,3));
      });
    }

    getClassIcon(classData:any) {
      return classData.icon.replace(/\[gender\]/i, "male");
    }

    getItemClass(classData:any) {
      return classData.id === this.$scope.currentClass ? "active" : "";
    }

    previousClass() {
      var newClass = this.$scope.currentClass === "mage" ? "warrior" : "mage";
      this.$scope.currentClass = newClass;
    }

    nextClass() {
      var newClass = this.$scope.currentClass === "warrior" ? "mage" : "warrior";
      this.$scope.currentClass = newClass;
    }
  }

  app.directive('mainMenu', function () {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'games/rpg/directives/pages/mainMenu.html',
      controllerAs: 'mainMenu',
      controller: MainMenuController,
      link: function ($scope:any, element, attrs) {
        $scope.hero = attrs.hero;
        $scope.$watch(attrs.hero, function (hero) {
          $scope.hero = hero;
        });
      }
    };
  });
}
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

module rpg.directives.bits {
  app.directive('healthBar', () => {
    return {
      restrict: 'E',
      scope: {
        model: "="
      },
      templateUrl: 'games/rpg/directives/bits/healthBar.html',
      controller: ($scope) => {
        $scope.getProgressClass = (model) => {
          if (!model || !model.attributes) {
            return '';
          }
          var result:string[] = [];
          var pct:number = Math.round(model.attributes.hp / model.attributes.maxHP * 100);
          if (pct === 0) {
            result.push('dead');
          }
          if (pct < 33) {
            result.push("critical");
          }
          else if (pct < 66) {
            result.push("hurt");
          }
          else {
            result.push("fine");
          }
          return result.join(' ');
        };
        $scope.getProgressBarStyle = (model) => {
          if (!model || !model.attributes) {
            return {};
          }
          var pct:number = Math.ceil(model.attributes.hp / model.attributes.maxHP * 100);
          return {
            width: pct + '%'
          };
        };
      }
    };
  });
}


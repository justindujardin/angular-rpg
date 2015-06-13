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
  app.directive('gameCanvas', ['$compile', 'game', function ($compile, game:rpg.services.PowGameService) {
    return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
        $scope.canvas = element[0];
        var context = $scope.canvas.getContext("2d");
        context.webkitImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;

        window.addEventListener('resize', onResize, false);
        var $window = $(window);


        // Inspired by : http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/
//            $scope.canvas.addEventListener('touchstart', onTouchStart, false);
//            $scope.canvas.addEventListener('touchmove', onTouchMove, false);
//            $scope.canvas.addEventListener('touchend', onTouchEnd, false);
        window.addEventListener('resize', onResize, false);

        /**
         * Game analog input
         * TODO: Move this into a touch input component.
         */
        var gwi:any = game.world.input;
//            gwi.touchId = -1;
//            gwi.touchCurrent = new Point(0, 0);
//            gwi.touchStart = new Point(0, 0);
//            gwi.analogVector = new Point(0, 0);


        function relTouch(touch) {
          var canoffset = $($scope.canvas).offset();
          touch.gameX = touch.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
          touch.gameY = touch.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
          return touch;
        }

        var $window = $(window);

        function onTouchStart(e) {
          _.each(e.touches, function (t) {
            relTouch(t)
          });
          _.each(e.changedTouches, function (t) {
            relTouch(t)
          });
          for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            if (gwi.touchId < 0) {
              gwi.touchId = touch.identifier;
              gwi.touchStart.set(touch.gameX, touch.gameY);
              gwi.touchCurrent.copy(gwi.touchStart);
              gwi.analogVector.zero();
            }
          }
          gwi.touches = e.touches;
        }

        function onTouchMove(e) {
          // Prevent the browser from doing its default thing (scroll, zoom)
          e.preventDefault();
          _.each(e.touches, function (t) {
            relTouch(t)
          });
          _.each(e.changedTouches, function (t) {
            relTouch(t)
          });
          for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            if (gwi.touchId == touch.identifier) {
              gwi.touchCurrent.set(touch.gameX, touch.gameY);
              gwi.analogVector.copy(gwi.touchCurrent);
              gwi.analogVector.subtract(gwi.touchStart);
              break;
            }
          }
          gwi.touches = e.touches;
        }

        function onTouchEnd(e) {
          _.each(e.touches, function (t) {
            relTouch(t)
          });
          _.each(e.changedTouches, function (t) {
            relTouch(t)
          });
          gwi.touches = e.touches;
          for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            if (gwi.touchId == touch.identifier) {
              gwi.touchId = -1;
              gwi.analogVector.zero();
              break;
            }
          }
        }

        function onResize() {
          context.canvas.width = $window.width();
          context.canvas.height = $window.height();
          context.webkitImageSmoothingEnabled = false;
          context.mozImageSmoothingEnabled = false;
        }

        var tileView:pow2.game.GameMapView = new rpg.RPGMapView(element[0], game.loader);
        tileView.camera.extent.set(10, 10);
        tileView.setTileMap(game.tileMap);
        game.world.scene.addView(tileView);
        onResize();
      }
    };
  }]);
}

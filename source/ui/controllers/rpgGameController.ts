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

module rpg.controllers {
  app.controller('RPGGameController', [
    '$scope',
    '$timeout',
    'game',
    'powAlert',
    function ($scope, $timeout, game:rpg.services.PowGameService, powAlert:rpg.services.PowAlertService) {
      $scope.loadingTitle = "Pow2!";
      $scope.loadingMessage = "Asking Google for data...";
      $scope.loading = true;
      $scope.range = function (n) {
        return new Array(n);
      };
      $scope.resetGame = function () {
        game.resetGame();
        powAlert.show("Game Save Deleted.  This will take effect the next time you refresh.", null, 0);
      };
      $scope.getState = function () {
        return game.getSaveData();
      };
      $scope.saveGame = function () {
        var party = <pow2.scene.components.PlayerComponent>game.currentScene.componentByType(pow2.scene.components.PlayerComponent);
        if (party) {
          game.world.model.setKeyData('playerPosition', party.host.point);
        }
        var data = JSON.stringify(game.world.model.toJSON());
        game.saveGame(data);
        powAlert.show("Game Saved!", null, 0);
      };

      rpg.models.GameStateModel.getDataSource(()=> {
        $scope.$apply(()=> {
          $scope.loadingMessage = "Loading the things...";
        });

        var saveData:any = game.getSaveData();
        if (true || saveData) {
          game.loadGame(game.getSaveData(), ()=> {
            $scope.$apply(()=> {
              $scope.gameModel = game.world.model;
              $scope.party = game.world.model.party;
              $scope.inventory = game.world.model.inventory;
              $scope.player = game.world.model.party[0];
              $scope.loading = false;
              $scope.loaded = true;
            });
          });
        }
        else {
          $scope.$apply(()=> {
            $scope.menu = true;
            $scope.loading = false;
          });
        }
      });

      // Dialog bubbles
      game.world.scene.on('treasure:entered', (feature) => {
        if (typeof feature.gold !== 'undefined') {
          game.world.model.addGold(feature.gold);
          powAlert.show("You found " + feature.gold + " gold!", null, 0);
        }
        if (typeof feature.item === 'string') {
          // Get items data from spreadsheet
          rpg.models.GameStateModel.getDataSource((data:pow2.GameDataResource) => {
            var item:rpg.models.ItemModel = null;
            var desc:any = _.where(data.getSheetData('weapons'), {id: feature.item})[0];
            if (desc) {
              item = new rpg.models.WeaponModel(desc);
            }
            else {
              desc = _.where(data.getSheetData('armor'), {id: feature.item})[0];
              if (desc) {
                item = new rpg.models.ArmorModel(desc);
              }
            }
            if (!item) {
              return;
            }
            game.world.model.inventory.push(item);
            powAlert.show("You found " + item.get('name') + "!", null, 0);

          });

        }
      });


      game.currentScene.on(pow2.tile.TileMap.Events.MAP_LOADED, (map:rpg.GameTileMap) => {
        game.world.model.setKeyData('playerMap', map.map.url);
      });
      // TODO: A better system for game event handling.
      game.machine.on('enter', (state) => {
        if (state.name === rpg.states.GameCombatState.NAME) {
          $scope.$apply(()=> {
            $scope.combat = state.machine;
            $scope.inCombat = true;
            state.machine.on('combat:attack', (data:rpg.states.combat.CombatAttackSummary)=> {
              var _done = state.machine.notifyWait();
              var msg:string = '';
              var a = data.attacker.model.get('name');
              var b = data.defender.model.get('name');
              if (data.damage > 0) {
                msg = a + " attacked " + b + " for " + data.damage + " damage!";
              }
              else {
                msg = a + " attacked " + b + ", and MISSED!";
              }
              powAlert.show(msg, _done);
            });
            state.machine.on('combat:run', (data:rpg.components.combat.actions.CombatRunSummary)=> {
              var _done = state.machine.notifyWait();
              var msg:string = data.player.model.get('name');
              if (data.success) {
                msg += ' bravely ran away!';
              }
              else {
                msg += ' failed to escape!';
              }
              powAlert.show(msg, _done);
            });
            state.machine.on('combat:victory', (data:rpg.states.combat.CombatVictorySummary) => {
              var _done = state.machine.notifyWait();
              powAlert.show("Found " + data.gold + " gold!", null, 0);
              powAlert.show("Gained " + data.exp + " experience!", null, 0);
              angular.forEach(data.levels, (hero:rpg.models.HeroModel) => {
                powAlert.show(hero.get('name') + " reached level " + hero.get('level') + "!", null, 0);
              });
              powAlert.show("Enemies Defeated!", _done);
            });
            state.machine.on('combat:defeat', (data:rpg.states.combat.CombatDefeatSummary) => {
              powAlert.show("Your party was defeated...", () => {
                game.loadGame(game.getSaveData(), ()=> {
                  $scope.$apply(()=> {
                    $scope.gameModel = game.world.model;
                    $scope.party = game.world.model.party;
                    $scope.inventory = game.world.model.inventory;
                    $scope.player = game.world.model.party[0];
                    $scope.combat = null;
                    $scope.inCombat = false;
                  });
                });
              }, 0);
            });
          });
        }
      });
      game.machine.on('exit', (state) => {
        $scope.$apply(() => {
          if (state.name === rpg.states.GameMapState.NAME) {
            $scope.dialog = null;
            $scope.store = null;
          }
          else if (state.name === rpg.states.GameCombatState.NAME) {
            $scope.inCombat = false;
            $scope.combat = null;
          }
        });
        console.log("UI: Exited state: " + state.name);
      });
    }
  ]);
}


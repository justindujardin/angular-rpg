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

/// <reference path="gameStateMachine.ts" />
/// <reference path="./gameCombatState.ts" />

module rpg.states {

  export class GameMapState extends pow2.State {
    static NAME:string = "map";
    name:string = GameMapState.NAME;
    mapPoint:pow2.Point = null;
    map:rpg.GameTileMap = null;

    enter(machine:GameStateMachine) {
      super.enter(machine);
      if (machine.player && this.mapPoint) {
        machine.player.setPoint(this.mapPoint);
        this.mapPoint = null;
      }
      console.log("MAPPPPPPP");
    }

    exit(machine:GameStateMachine) {
      if (machine.player) {
        this.mapPoint = machine.player.point.clone();
      }
    }
  }
}
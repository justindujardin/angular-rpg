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

import * as rpg from '../game';
import {GameWorld} from '../gameWorld';
import {GameStateModel} from '../models/gameStateModel';
import {PlayerMapState} from './playerMapState';
import {PlayerCombatState} from './playerCombatState';

export class PlayerDefaultState extends pow2.State {
  static NAME:string = "default";
  name:string = PlayerDefaultState.NAME;
}

export class GameStateMachine extends pow2.StateMachine {
  world:GameWorld;
  model:GameStateModel = null;
  defaultState:string = PlayerDefaultState.NAME;
  player:pow2.tile.TileObject = null;
  encounterInfo:rpg.IZoneMatch = null;
  encounter:rpg.IGameEncounter = null;
  states:pow2.IState[] = [
    new PlayerDefaultState(),
    new PlayerMapState(),
    new PlayerCombatState()
  ];

  onAddToWorld(world:GameWorld) {
    super.onAddToWorld(world);
    GameStateModel.getDataSource();
    this.model = world.model || new GameStateModel();
  }

  setCurrentState(newState:any):boolean {
    if (this.world && this.world.scene) {
      var scene:pow2.scene.Scene = this.world.scene;
      this.player = <pow2.tile.TileObject>scene.objectByComponent(pow2.scene.components.PlayerComponent);
    }
    return super.setCurrentState(newState);
  }

}

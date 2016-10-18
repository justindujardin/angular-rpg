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
import {GameWorld} from '../../../app/services/gameWorld';
import {PlayerMapState} from './playerMapState';
import {PlayerCombatState} from './playerCombatState';
import {State, IState} from '../../pow2/core/state';
import {StateMachine} from '../../pow2/core/stateMachine';
import {TileObject} from '../../pow2/tile/tileObject';
import {PlayerComponent} from '../components/playerComponent';
import {Scene} from '../../pow2/scene/scene';

export class PlayerDefaultState extends State {
  static NAME: string = "default";
  name: string = PlayerDefaultState.NAME;
}

export class GameStateMachine extends StateMachine {
  world: GameWorld;
  defaultState: string = PlayerDefaultState.NAME;
  player: TileObject = null;
  encounterInfo: rpg.IZoneMatch = null;
  encounter: rpg.IGameEncounter = null;
  states: IState[] = [
    new PlayerDefaultState(),
    new PlayerMapState(),
    new PlayerCombatState()
  ];

  setCurrentState(newState: any): boolean {
    if (!this.world) {
      this.world = GameWorld.get();
    }
    if (this.world && this.world.scene) {
      var scene: Scene = this.world.scene;
      this.player = <TileObject>scene.objectByComponent(PlayerComponent);
    }
    return super.setCurrentState(newState);
  }

}

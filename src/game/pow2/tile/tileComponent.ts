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

import {TileObject} from './tileObject';
import {TileMap} from './tileMap';
import {SceneComponent} from '../scene/sceneComponent';
export class TileComponent extends SceneComponent {
  host: TileObject;
  isEntered: boolean;

  /**
   * Events triggered on host object for enter/exit of
   * tiles.
   */
  static Events: any = {
    ENTERED: "tile:entered",
    EXITED: "tile:exited"
  };

  syncComponent(): boolean {
    return !!this.host.tileMap && this.host.tileMap instanceof TileMap;
  }

  disconnectComponent(): boolean {
    return true;
  }

  enter(object: TileObject): boolean {
    return true;
  }

  entered(object: TileObject) {
    this.host.trigger(TileComponent.Events.ENTERED, this);
    this.isEntered = true;
    return true;
  }

  exit(object: TileObject): boolean {
    return true;
  }

  exited(object: TileObject) {
    this.host.trigger(TileComponent.Events.EXITED, this);
    this.isEntered = false;
    return true;
  }
}

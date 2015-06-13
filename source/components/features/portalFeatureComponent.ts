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

/// <reference path="../gameFeatureComponent.ts" />
module rpg.components.features {
  export class PortalFeatureComponent extends GameFeatureComponent {
    map:string;
    target:pow2.Point;

    syncComponent():boolean {
      if (!super.syncComponent()) {
        return false;
      }
      this.map = this.host.feature.target;
      this.target = new pow2.Point(this.host.feature.targetX, this.host.feature.targetY);
      return !!this.map;
    }

    entered(object:pow2.tile.TileObject):boolean {
      if (!this.target || !this.host.tileMap) {
        return false;
      }
      // TODO: What about all this map loading crap?  Have to load TMX resource
      // in each spot and then call createObject on it with the entity container.
      // Kind of a PITA if you ask me, and we keep duplicating the "/maps/{name}.tmx"
      // stuff all over the place.  Maybe a wrapper function that does that?
      this.host.world.loader.load(pow2.getMapUrl(this.map), (map:pow2.TiledTMXResource)=> {
        this.host.tileMap.setMap(map);
        console.log("Transition to " + this.map);
        object.setPoint(this.target);
        this.host.tileMap.syncComponents();
      });
      return true;
    }

  }

}
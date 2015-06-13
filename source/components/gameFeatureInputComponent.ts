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

/// <reference path="../objects/gameFeatureObject.ts" />

module rpg.components {
  export class GameFeatureInputComponent extends pow2.scene.components.TickedComponent {
    hitBox:pow2.Rect = new pow2.Rect(0, 0, 1, 1);
    hits:pow2.tile.TileObject[] = [];
    mouse:pow2.NamedMouseElement = null;

    syncComponent():boolean {
      if (!super.syncComponent() || !this.host.scene || !this.host.scene.world || !this.host.scene.world.input) {
        return false;
      }
      this.mouse = this.host.scene.world.input.getMouseHook("world");
      return !!this.mouse;
    }

    tick(elapsed:number) {
      // Calculate hits in Scene for machine usage.
      if (!this.host.scene || !this.mouse) {
        return;
      }
      _.each(this.hits, (tile:pow2.tile.TileObject) => {
        tile.scale = 1;
      });

      // Quick array clear
      this.hits.length = 0;

      this.hitBox.point.set(this.mouse.world);
      this.host.scene.db.queryRect(this.hitBox, rpg.objects.GameFeatureObject, this.hits);

      _.each(this.hits, (obj:any) => {
        obj.scale = 1.25;
      });
      super.tick(elapsed);
    }
  }
}
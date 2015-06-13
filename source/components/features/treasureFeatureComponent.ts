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

/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />

module rpg.components.features {
  export class TreasureFeatureComponent extends GameFeatureComponent {
    gold:number;
    item:string;
    icon:string;

    connectComponent():boolean {
      if (typeof this.host.id === 'undefined') {
        console.error("Treasure must have a given id so it may be hidden");
        return false;
      }
      return super.connectComponent();
    }

    syncComponent():boolean {
      if (!super.syncComponent() || !this.host.feature) {
        return false;
      }
      this.name = "Treasure Chest";
      this.gold = this.host.feature.gold;
      this.item = this.host.feature.item;
      this.icon = this.host.feature.icon;
      return true;
    }

    enter(object:pow2.tile.TileObject):boolean {
      object.scene.trigger('treasure:entered', this);
      this.setDataHidden(true);
      return true;
    }
  }
}
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

import {GameFeatureObject} from '../objects/gameFeatureObject';

/**
 * A component that defines the functionality of a map feature.
 */
export class GameFeatureComponent extends pow2.tile.TileComponent {
  host:GameFeatureObject;

  connectComponent():boolean {
    if (!super.connectComponent()) {
      return false;
    }
    if (!this.host.feature) {
      console.log("Feature host missing feature data.");
      return false;
    }
    // Inherit ID from the unique feature data's id.
    this.id = this.host.feature.id;
    return true;
  }

  syncComponent():boolean {
    if (!super.syncComponent()) {
      return false;
    }
    this.host.visible = this.host.enabled = !this.getDataHidden();
    return true;
  }


  /**
   * Hide and disable a feature object in a persistent manner.
   * @param hidden Whether to hide or unhide the object.
   */
  setDataHidden(hidden:boolean = true) {
    if (this.host && this.host.world && this.host.world.model && this.host.id) {
      this.host.world.model.setKeyData('' + this.host.id, {
        hidden: hidden
      });
      this.syncComponent();
    }
  }

  /**
   * Determine if a feature has been persistently hidden by a call
   * to `hideFeature`.
   */
  getDataHidden():boolean {
    if (this.host && this.host.world && this.host.world.model && this.host.id) {
      var data:any = this.host.world.model.getKeyData('' + this.host.id);
      if (data && data.hidden) {
        return true;
      }
    }
    return false;
  }
}

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

import * as _ from 'underscore';
import {GameFeatureComponent} from '../gameFeatureComponent';
import {data} from '../../../pow2/core/api';
import {TileObject} from '../../../pow2/tile/tileObject';

export class StoreFeatureComponent extends GameFeatureComponent {
  name: string;
  inventory: any[];

  syncComponent(): boolean {
    if (!super.syncComponent()) {
      return false;
    }
    this.name = this.host.feature.name;
    var weapons: boolean = _.indexOf(this.host.groups, "weapon") !== -1;
    if (weapons) {
      this.inventory = _.filter(data.weapons, (item: any) => {
        return item.level === this.host.feature.level;
      });
    }
    else if (_.indexOf(this.host.groups, "armor") !== -1) {
      this.inventory = _.filter(data.armor, (item: any) => {
        return item.level === this.host.feature.level;
      });

    }
    return true;
  }

  disconnectComponent(): boolean {
    this.inventory = null;
    return super.disconnectComponent();
  }

  enter(object: TileObject): boolean {
    object.scene.trigger('store:entered', this);
    return true;
  }

  exit(object: TileObject): boolean {
    object.scene.trigger('store:exited', this);
    return true;
  }

}


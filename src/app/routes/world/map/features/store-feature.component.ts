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
import {TiledFeatureComponent, TiledMapFeatureData} from '../map-feature.component';
import {TileObject} from '../../../../../game/pow2/tile/tileObject';
import {Component, Input} from '@angular/core';
@Component({
  selector: 'store-feature',
  template: `<ng-content></ng-content>`
})
export class StoreFeatureComponent extends TiledFeatureComponent {
  name: string;
  inventory: any[];
  @Input() feature: TiledMapFeatureData;

  syncBehavior(): boolean {
    if (!super.syncBehavior()) {
      return false;
    }
    this.name = this.host.feature.name;
    return true;
  }

  disconnectBehavior(): boolean {
    this.inventory = null;
    return super.disconnectBehavior();
  }

  enter(object: TileObject): boolean {
    object.scene.trigger('StoreFeatureComponent:entered', this);
    return true;
  }

  exit(object: TileObject): boolean {
    object.scene.trigger('StoreFeatureComponent:exited', this);
    return true;
  }

}

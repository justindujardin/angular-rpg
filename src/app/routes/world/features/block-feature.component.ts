/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import { Component } from '@angular/core';
import { TileObject } from '../../../scene/tile-object';
import { MapFeatureComponent } from '../map-feature.component';

@Component({
  selector: 'block-feature',
  template: ` <ng-content></ng-content>`,
})
export class BlockFeatureComponent extends MapFeatureComponent {
  entered(object: TileObject): boolean {
    this.assertFeature();
    return false;
  }
}

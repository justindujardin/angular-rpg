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
import { Component, Input } from '@angular/core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { TileObject } from '../../../scene/tile-object';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface IBlockFeatureProperties extends IMapFeatureProperties {
  passable: boolean;
}

@Component({
  selector: 'block-feature',
  template: ` <ng-content></ng-content>`,
})
export class BlockFeatureComponent extends MapFeatureComponent {
  @Input() feature: ITiledObject<IBlockFeatureProperties> | null = null;

  enter(object: TileObject): boolean {
    return false;
  }
}

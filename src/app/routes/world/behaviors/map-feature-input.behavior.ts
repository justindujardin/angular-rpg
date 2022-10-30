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
import * as _ from 'underscore';
import { Rect } from '../../../../app/core/rect';
import { TickedBehavior } from '../../../behaviors/ticked-behavior';
import { NamedMouseElement } from '../../../core/input';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { Scene } from '../../../scene/scene';
import { TileObject } from '../../../scene/tile-object';

@Component({
  selector: 'map-feature-input-behavior',
  template: `<ng-content></ng-content>`,
})
export class MapFeatureInputBehaviorComponent extends TickedBehavior {
  hitBox: Rect = new Rect(0, 0, 1, 1);
  hits: TileObject[] = [];
  mouse: NamedMouseElement | null = null;

  @Input() scene: Scene;

  syncBehavior(): boolean {
    if (!super.syncBehavior() || !this.host?.scene?.world?.input) {
      return false;
    }
    this.mouse = this.host.scene.world.input.getMouseHook('world');
    return !!this.mouse;
  }

  tick(elapsed: number) {
    // Calculate hits in Scene for machine usage.
    if (!this.host?.scene || !this.mouse) {
      return;
    }
    _.each(this.hits, (tile: TileObject) => {
      tile.scale = 1;
    });

    // Quick array clear
    this.hits.length = 0;

    this.hitBox.point.set(this.mouse.world);
    this.host.scene.db.queryRect(this.hitBox, GameFeatureObject, this.hits);

    _.each(this.hits, (obj: any) => {
      obj.scale = 1.25;
    });
    super.tick(elapsed);
  }
}

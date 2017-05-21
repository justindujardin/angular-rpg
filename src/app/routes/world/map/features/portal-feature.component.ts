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
import {TileObject} from '../../../../../game/pow2/tile/tile-object';
import {Component, Input} from '@angular/core';
import {AppState} from '../../../../app.model';
import {Store} from '@ngrx/store';
import {GameStateTravelAction} from '../../../../models/game-state/game-state.actions';
@Component({
  selector: 'portal-feature',
  template: `
    <ng-content></ng-content>`
})
export class PortalFeatureComponent extends TiledFeatureComponent {
  @Input() feature: TiledMapFeatureData;

  constructor(private store: Store<AppState>) {
    super();
  }

  entered(object: TileObject): boolean {
    this.assertFeature();

    if (!this.properties.target) {
      return false;
    }
    this.store.dispatch(new GameStateTravelAction({
      location: this.properties.target,
      position: {
        x: this.properties.targetX,
        y: this.properties.targetY
      }
    }));
    return true;
  }

}

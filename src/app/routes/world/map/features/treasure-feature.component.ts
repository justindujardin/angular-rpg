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
import {GameStateAddGoldAction} from '../../../../models/game-state/game-state.actions';
import {EntityAddItemAction} from '../../../../models/entity/entity.actions';
import {Item} from '../../../../models/item';
import {AppState} from '../../../../app.model';
import {Store} from '@ngrx/store';
import {NotificationService} from '../../../../components/notification/notification.service';

@Component({
  selector: 'treasure-feature',
  template: `
    <ng-content></ng-content>`
})
export class TreasureFeatureComponent extends TiledFeatureComponent {
  @Input() feature: TiledMapFeatureData;

  constructor(public store: Store<AppState>,
              public notify: NotificationService) {
    super();
  }

  connectBehavior(): boolean {
    if (!this.properties || !this.properties.id) {
      console.error('Treasure must have a given id so it may be hidden');
      return false;
    }
    return super.connectBehavior();
  }

  syncBehavior(): boolean {
    if (!super.syncBehavior() || !this.host.feature) {
      return false;
    }
    this.name = 'Treasure Chest';
    return true;
  }

  enter(object: TileObject): boolean {
    if (typeof this.properties.gold !== 'undefined') {
      this.store.dispatch(new GameStateAddGoldAction(this.properties.gold));
      this.notify.show(`You found ${this.properties.gold} gold!`, null, 0);
    }
    if (typeof this.properties.item === 'string') {
      console.warn('treasure items need fixin\'');
      const item = null; // this.host.world.itemModelFromId<Item>(this.properties.item);
      if (!item) {
        return;
      }
      this.store.dispatch(new EntityAddItemAction(item));
      this.notify.show(`You found ${item.name}!`, null, 0);
    }

    console.warn('set data hidden treasure feature');
    // this.setDataHidden(true);
    return true;
  }
}

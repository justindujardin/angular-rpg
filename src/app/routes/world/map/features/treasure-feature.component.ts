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
import { AfterViewInit, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { getArmorById } from 'app/models/game-data/armors';
import { getItemById } from 'app/models/game-data/items';
import { getWeaponById } from 'app/models/game-data/weapons';
import { AppState } from '../../../../app.model';
import { NotificationService } from '../../../../components/notification/notification.service';
import { EntityAddItemAction } from '../../../../models/entity/entity.actions';
import {
  instantiateEntity,
  ITemplateBaseItem,
} from '../../../../models/game-data/game-data.model';
import {
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
  GameStateSetKeyDataAction,
} from '../../../../models/game-state/game-state.actions';
import { Item } from '../../../../models/item';
import { TileObject } from '../../../../scene/tile-object';
import { TiledFeatureComponent, TiledMapFeatureData } from '../map-feature.component';

@Component({
  selector: 'treasure-feature',
  template: ` <ng-content></ng-content>`,
})
export class TreasureFeatureComponent
  extends TiledFeatureComponent
  implements AfterViewInit
{
  // Used as a recursion guard while the async treasure claiming process happens
  private taken = false;
  // @ts-ignore
  @Input() feature: TiledMapFeatureData;

  constructor(public store: Store<AppState>, public notify: NotificationService) {
    super();
  }

  ngAfterViewInit() {
    if (!this.properties.id) {
      throw new Error('treasure must always have a unique lower-snake-case id');
    }
  }

  enter(object: TileObject): boolean {
    if (this.taken === true) {
      return;
    }
    this.taken = true;
    if (typeof this.properties.gold !== 'undefined') {
      this.store.dispatch(new GameStateAddGoldAction(this.properties.gold));
      this.notify.show(`You found ${this.properties.gold} gold!`, null, 0);
    } else if (typeof this.properties.item === 'string') {
      const templateId = this.properties.item;
      let template: ITemplateBaseItem | null = getItemById(templateId);
      if (!template) {
        template = getWeaponById(templateId);
      }
      if (!template) {
        template = getArmorById(templateId);
      }
      if (!template) {
        throw new Error('could not find item template for id: ' + this.properties.item);
      }
      const itemInstance = instantiateEntity<Item>(template);
      this.store.dispatch(new EntityAddItemAction(itemInstance));
      this.store.dispatch(new GameStateAddInventoryAction(itemInstance));
      this.notify.show(`You found ${template.name}!`, null, 0);
    } else if (typeof this.properties.text === 'string') {
      this.notify.show(`You found ${this.properties.text}!`, null, 0);
    }
    this.store.dispatch(new GameStateSetKeyDataAction(this.properties.id, true));
    return true;
  }
}

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
import { getArmorById } from 'app/models/game-data/armors';
import { getItemById } from 'app/models/game-data/items';
import { getWeaponById } from 'app/models/game-data/weapons';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { EntityAddItemAction } from '../../../models/entity/entity.actions';
import {
  instantiateEntity,
  ITemplateBaseItem,
} from '../../../models/game-data/game-data.model';
import {
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
  GameStateSetKeyDataAction,
} from '../../../models/game-state/game-state.actions';
import { Item } from '../../../models/item';
import { assertTrue } from '../../../models/util';
import { TileObject } from '../../../scene/tile-object';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface ITreasureFeatureProperties extends IMapFeatureProperties {
  id: string;
  gold?: number;
  item?: string;
  text?: string;
}

@Component({
  selector: 'treasure-feature',
  template: ` <ng-content></ng-content>`,
})
export class TreasureFeatureComponent
  extends MapFeatureComponent
  implements AfterViewInit
{
  // Used as a recursion guard while the async treasure claiming process happens
  private taken = false;
  @Input() feature: ITiledObject<ITreasureFeatureProperties> | null = null;

  ngAfterViewInit() {
    super.ngAfterViewInit();
    if (!this.feature?.properties?.id) {
      throw new Error('treasure must always have a unique lower-snake-case id');
    }
  }

  enter(object: TileObject): boolean {
    if (this.taken === true) {
      return true;
    }
    this.taken = true;
    const properties = this.feature?.properties;
    assertTrue(properties, 'treasure has no properties');
    if (typeof properties.gold !== 'undefined') {
      this.store.dispatch(new GameStateAddGoldAction(properties.gold));
      this.notify.show(`You found ${properties.gold} gold!`, undefined, 0);
    } else if (typeof properties.item === 'string') {
      const templateId = properties.item;
      let template: ITemplateBaseItem | null = getItemById(templateId);
      if (!template) {
        template = getWeaponById(templateId);
      }
      if (!template) {
        template = getArmorById(templateId);
      }
      if (!template) {
        throw new Error('could not find item template for id: ' + properties.item);
      }
      const itemInstance = instantiateEntity<Item>(template);
      this.store.dispatch(new EntityAddItemAction(itemInstance));
      this.store.dispatch(new GameStateAddInventoryAction(itemInstance));
      this.notify.show(`You found ${template.name}!`, undefined, 0);
    } else if (typeof properties.text === 'string') {
      this.notify.show(`You found ${properties.text}!`, undefined, 0);
    } else {
      this.notify.show(`It's empty.`, undefined, 0);
    }
    this.store.dispatch(new GameStateSetKeyDataAction(properties.id, true));
    return true;
  }
}

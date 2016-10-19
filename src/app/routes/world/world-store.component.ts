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
import * as rpg from '../../../game/rpg/game';
import {Component, ViewEncapsulation, Input, Output} from '@angular/core';
import {RPGGame, Notify} from '../../services';
import {GameStateModel} from '../../../game/rpg/models/gameStateModel';
import {ItemModel} from '../../../game/rpg/models/all';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {ItemRemoveAction, ItemAddAction} from '../../models/item/item.actions';
import {StoreFeatureComponent} from '../../../game/rpg/components/features/storeFeatureComponent';
import {BehaviorSubject, Observable} from 'rxjs';
import {IScene} from '../../../game/pow2/interfaces/IScene';
import {Item} from '../../models/item/item.model';

@Component({
  selector: 'world-store',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./world-store.component.scss'],
  templateUrl: './world-store.component.html',
})
export class WorldStore {

  private _name$ = new BehaviorSubject<string>('Invalid Store');
  name$: Observable<string> = this._name$;

  private _selling$ = new BehaviorSubject<boolean>(false);
  /** Determine if the UI is in a selling state. */
  selling$: Observable<boolean> = this._selling$;

  private _selected$ = new BehaviorSubject<Item>(null);
  /** The selected item to purchase/sell. */
  selected$: Observable<Item> = this._selected$;


  isBuying$: Observable<boolean> = Observable
    .combineLatest(this.selected$, this.selling$, (selected: boolean, selling: boolean) => {
      return !selected && !selling;
    });

  isSelling$: Observable<boolean> = Observable
    .combineLatest(this.selected$, this.selling$, (selected: boolean, selling: boolean) => {
      return !selected && selling;
    });

  actionVerb$: Observable<string> = this.selling$.map((selling: boolean) => {
    return selling ? 'Sell' : 'Buy';
  });


  // Have to add @Input() here because decorators are not inherited with extends
  @Input() scene: IScene;

  private _inventory$ = new BehaviorSubject<rpg.IGameItem[]>([]);
  inventory$: Observable<rpg.IGameItem[]> = this._inventory$;

  constructor(public game: RPGGame,
              public notify: Notify,
              public store: Store<AppState>) {
  }

  @Input()
  set feature(feature: StoreFeatureComponent) {
    // Get enemies data from spreadsheet
    const data = this.game.world.spreadsheet;

    let hasCategory: boolean = typeof feature.host.category !== 'undefined';
    let theChoices: any[] = [];
    ['weapons', 'armor', 'items'].forEach((category: string) => {
      if (!hasCategory || feature.host.category === category) {
        theChoices = theChoices.concat(data.getSheetData(category));
      }
    });
    let items: rpg.IGameItem[] = [];
    _.each(feature.host.groups, (group: string) => {
      items = items.concat(_.filter(theChoices, (c: any) => {
        // Include items with no "groups" value or items with matching groups.
        return !c.groups || _.indexOf(c.groups, group) !== -1;
      }));
    });

    this._name$.next(feature.name);
    this._inventory$.next(<rpg.IGameItem[]>_.map(_.where(items, {
      level: feature.host.feature.level
    }), (i: any) => _.extend({}, i)));
  }

  close() {
    this._selling$.next(false);
    this._selected$.next(null);
  }

  actionItem(item: any) {
    if (!item) {
      return;
    }

    const model: GameStateModel = this.game.world.model;
    const value: number = parseInt(item.cost);
    if (this.selling) {
      let itemIndex: number = -1;
      for (let i = 0; i < model.inventory.length; i++) {
        if (model.inventory[i].id === item.id) {
          itemIndex = i;
          break;
        }
      }
      if (itemIndex !== -1) {
        model.gold += value;
        this.notify.show(`Sold ${item.name} for ${item.cost} gold.`, null, 1500);
        this.store.dispatch(new ItemRemoveAction(item));
        model.inventory.splice(itemIndex, 1);
      }
    }
    else {
      if (value > model.gold) {
        this.notify.show("You don't have enough money");
        return;
      }
      else {
        model.gold -= value;
        this.notify.show("Purchased " + item.name + ".", null, 1500);
        let instanceModel = this.game.world.itemModelFromId<ItemModel>(item.id);
        this.store.dispatch(new ItemAddAction(item));
        if (!instanceModel) {
          throw new Error("Tried (and failed) to create item from invalid id: '" + item.id + "'.  Make sure ID is present in game data source");
        }
        model.inventory.push(instanceModel);
      }
    }

    this._selected$.next(null);
    this._selling$.next(false);

  }

  toggleAction() {
    if (!this._selling$.value) {
      if (this._inventory$.value.length === 0) {
        this.notify.show("You don't have any unequipped inventory to sell.", null, 1500);
        this._selling$.next(false);
        return;
      }
    }
    this._selling$.next(!this._selling$.value);
  }

  selectItem(item: any) {
    if (item instanceof ItemModel) {
      item = item.toJSON();
    }
    this._selected$.next(item);
  }

}

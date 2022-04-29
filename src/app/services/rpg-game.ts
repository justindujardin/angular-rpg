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
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { first } from 'rxjs/operators';
import * as _ from 'underscore';
import { ResourceManager } from '../../game/pow-core/resource-manager';
import { AppState } from '../app.model';
import { EntityType, IPartyMember } from '../models/base-entity';
import {
  EntityAddBeingAction,
  EntityAddItemAction,
} from '../models/entity/entity.actions';
import { Entity, EntitySlots } from '../models/entity/entity.model';
import {
  instantiateEntity,
  ITemplateArmor,
  ITemplateBaseItem,
  ITemplateClass,
  ITemplateWeapon,
} from '../models/game-data/game-data.model';
import {
  GameStateAddInventoryAction,
  GameStateEquipItemAction,
  GameStateLoadAction,
  GameStateNewAction,
  GameStateTravelAction,
} from '../models/game-state/game-state.actions';
import { GameState } from '../models/game-state/game-state.model';
import { GameStateService } from '../models/game-state/game-state.service';
import { Item } from '../models/item';

@Injectable()
export class RPGGame {
  constructor(public loader: ResourceManager, private store: Store<AppState>) {}

  public create(type: EntityType, name: string): Entity {
    const HERO_DEFAULTS: Partial<Entity> = {
      eid: 'invalid-hero',
      status: [],
      type,
      name,
      level: 1,
      exp: 0,
    };
    const classDetails = classes.get(type);
    let character: Entity = null;
    switch (type) {
      case 'warrior':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'warrior-123',
          ...classDetails,
          icon: 'warrior-male.png',
        });
        break;
      case 'healer':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'lifemage-123',
          ...classDetails,
          icon: 'magician-female.png',
        });
        break;
      case 'ranger':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'ranger-123',
          ...classDetails,
          icon: 'ranger-female.png',
        });
        break;
      case 'mage':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'deathmage-123',
          ...classDetails,
          icon: 'magician-male.png',
        });
        break;
      default:
        throw new Error('Unknown character class: ' + type);
    }
    character = _.extend(character, {
      maxhp: character.hp,
      maxmp: character.mp,
    });
    return character;
  }

  giveItemToPlayer(
    player: IPartyMember,
    templateItem: ITemplateBaseItem,
    equipSlot: keyof EntitySlots
  ) {
    if (!templateItem) {
      return;
    }
    const itemInstance = instantiateEntity<Item>(templateItem);
    this.store.dispatch(new EntityAddItemAction(itemInstance));
    this.store.dispatch(new GameStateAddInventoryAction(itemInstance));
    this.store.dispatch(
      new GameStateEquipItemAction({
        entityId: player.eid,
        slot: equipSlot,
        itemId: itemInstance.eid,
      })
    );
  }

  /**
   * Initialize the game and resolve a promise that indicates whether the game
   * is new or was loaded from save data.  Resolves with true if the game is new.
   */
  initGame(
    load: boolean = !!localStorage.getItem(GameStateService.STATE_KEY)
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      if (load) {
        // Set the root game state
        this.store.dispatch(new GameStateLoadAction());
        resolve(false);
        return;
      }
      const classes: Immutable.Map<string, ITemplateClass> = await this.store
        .select(getGameDataClassesById)
        .pipe(first())
        .toPromise();

      const weapons: Immutable.Map<string, ITemplateWeapon> = await this.store
        .select(getGameDataWeaponsById)
        .pipe(first())
        .toPromise();

      const armors: Immutable.Map<string, ITemplateArmor> = await this.store
        .select(getGameDataArmorsById)
        .pipe(first())
        .toPromise();

      const warrior = this.create('warrior', 'Warrior', classes);
      const ranger = this.create('ranger', 'Ranger', classes);
      const healer = this.create('healer', 'Mage', classes);
      const initialState: GameState = {
        party: Immutable.List<string>([warrior.eid, ranger.eid, healer.eid]),
        inventory: Immutable.List<string>(),
        battleCounter: 0,
        keyData: Immutable.Map<string, any>(),
        gold: 100,
        combatZone: '',
        location: 'town',
        position: { x: 12, y: 8 },
        boardedShip: false,
        shipPosition: { x: 7, y: 23 },
      };
      this.store.dispatch(new GameStateNewAction(initialState));
      this.store.dispatch(new EntityAddBeingAction(warrior));
      this.store.dispatch(new EntityAddBeingAction(ranger));
      this.store.dispatch(new EntityAddBeingAction(healer));

      // Provide basic equipment
      this.giveItemToPlayer(warrior, weapons.get('club'), 'weapon');
      this.giveItemToPlayer(warrior, armors.get('clothes'), 'armor');
      this.giveItemToPlayer(ranger, weapons.get('slingshot'), 'weapon');
      this.giveItemToPlayer(ranger, armors.get('clothes'), 'armor');
      this.giveItemToPlayer(healer, weapons.get('short-staff'), 'weapon');
      this.giveItemToPlayer(healer, armors.get('cloak'), 'armor');

      this.store.dispatch(new GameStateTravelAction(initialState));
      resolve(true);
    });
  }
}

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
import {ItemModel} from '../../game/rpg/models/itemModel';
import {GameStateMachine} from '../../game/rpg/states/gameStateMachine';
import {ResourceManager} from '../../game/pow-core/resource-manager';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {GameStateLoadAction, GameStateNewAction, GameStateTravelAction} from '../models/game-state/game-state.actions';
import {AppState} from '../app.model';
import {GameState} from '../models/game-state/game-state.model';
import * as _ from 'underscore';
import {Entity, EntityType} from '../models/entity/entity.model';
import {EntityAddBeingAction} from '../models/entity/entity.actions';
import {GameStateService} from '../models/game-state/game-state.service';

import * as Immutable from 'immutable';

@Injectable()
export class RPGGame {
  constructor(public loader: ResourceManager,
              private store: Store<AppState>) {
  }

  static getHPForLevel(level: number, model: Entity): number {
    return Math.floor(model.basedefense * Math.pow(level, 1.1)) + (model.basedefense * 2);
  }

  static create(type: EntityType, name: string) {
    const HERO_DEFAULTS: Partial<Entity> = {
      eid: 'invalid-hero',
      type,
      name,
      level: 1,
      exp: 0,
      baseattack: 0,
      basespeed: 0,
      basemagic: 0,
      basedefense: 0
    };
    let character: Entity = null;
    switch (type) {
      case 'warrior':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'warrior-123',
          icon: 'warrior-male.png',
          baseattack: 10,
          basespeed: 2,
          basemagic: 1,
          basedefense: 7
        });
        break;
      case 'healer':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'lifemage-123',
          icon: 'magician-female.png',
          baseattack: 1,
          basespeed: 6,
          basemagic: 9,
          basedefense: 4
        });
        break;
      case 'ranger':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'ranger-123',
          icon: 'ranger-female.png',
          baseattack: 3,
          basespeed: 10,
          basemagic: 2,
          basedefense: 5,
        });
        break;
      case 'mage':
        character = _.extend({}, HERO_DEFAULTS, {
          eid: 'deathmage-123',
          icon: 'magician-male.png',
          baseattack: 2,
          basespeed: 10,
          basemagic: 4,
          basedefense: 4,
        });
        break;
      default:
        throw new Error('Unknown character class: ' + type);
    }
    const hp = RPGGame.getHPForLevel(1, character);
    character = _.extend(character, {
      maxhp: hp,
      hp,
      defense: character.basedefense,
      speed: character.basespeed,
      attack: character.baseattack,
      magic: character.basemagic,
    });
    return character;
  }

  /**
   * Initialize the game and resolve a promise that indicates whether the game
   * is new or was loaded from save data.  Resolves with true if the game is new.
   */
  initGame(load: boolean = !!localStorage.getItem(GameStateService.STATE_KEY)): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (load) {
        // Set the root game state
        this.store.dispatch(new GameStateLoadAction());
        resolve(false);
      }
      else {
        const warrior = RPGGame.create('warrior', 'Warrior');
        const ranger = RPGGame.create('ranger', 'Ranger');
        const healer = RPGGame.create('healer', 'Mage');
        const initialState: GameState = {
          party: Immutable.List<string>([warrior.eid, ranger.eid, healer.eid]),
          inventory: Immutable.List<string>(),
          battleCounter: 0,
          keyData: Immutable.Map<string, any>(),
          gold: 200,
          combatZone: '',
          location: 'town',
          position: {x: 12, y: 8},
          boardedShip: false,
          shipPosition: {x: 0, y: 0}
        };
        this.store.dispatch(new GameStateNewAction(initialState));
        this.store.dispatch(new EntityAddBeingAction(warrior));
        this.store.dispatch(new EntityAddBeingAction(ranger));
        this.store.dispatch(new EntityAddBeingAction(healer));
        this.store.dispatch(new GameStateTravelAction(initialState));
        resolve(true);
      }
    });
  }

}

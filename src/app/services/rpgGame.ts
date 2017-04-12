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
import {ResourceLoader} from '../../game/pow-core/resourceLoader';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {GameStateLoadAction, GameStateNewAction} from '../models/game-state/game-state.actions';
import {AppState} from '../app.model';
import {GameState} from '../models/game-state/game-state.model';
import * as _ from 'underscore';
import {Entity, EntityType} from '../models/entity/entity.model';
import {EntityAddBeingAction} from '../models/entity/entity.actions';
import {GameStateService} from '../models/game-state/game-state.service';

@Injectable()
export class RPGGame {
  styleBackground: string = 'rgba(0,0,0,1)';
  private _renderCanvas: HTMLCanvasElement;
  private _canvasAcquired: boolean = false;

  constructor(public loader: ResourceLoader,
              private store: Store<AppState>) {
    this._renderCanvas = document.createElement('canvas') as HTMLCanvasElement;
    this._renderCanvas.width = this._renderCanvas.height = 64;
    this._renderCanvas.style.position = 'absolute';
    this._renderCanvas.style.left = this._renderCanvas.style.top = '-9000px';
    this.store.subscribe();
  }

  static getHPForLevel(level: number, model: Entity): number {
    return Math.floor(model.basedefense * Math.pow(level, 1.1)) + (model.basedefense * 2);
  }

  // awardLevelUp() {
  //   var nextLevel: number = this.attributes.level + 1;
  //   var newHP = this.getHPForLevel(nextLevel);
  //   this.set({
  //     level: nextLevel,
  //     maxhp: newHP,
  //     // REMOVE auto-heal when you level up.  I think I'd rather people die from time-to-time.
  //     //hp: newHP,
  //     attack: this.getStrengthForLevel(nextLevel),
  //     speed: this.getAgilityForLevel(nextLevel),
  //     defense: this.getVitalityForLevel(nextLevel),
  //     magic: this.getIntelligenceForLevel(nextLevel),
  //
  //     nextLevelExp: this.getXPForLevel(nextLevel + 1),
  //     prevLevelExp: this.getXPForLevel(nextLevel)
  //   });
  //   this.trigger('levelUp', this);
  // }

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
          party: [warrior.eid, ranger.eid, healer.eid],
          inventory: [],
          battleCounter: 0,
          keyData: {},
          gold: 200,
          combatZone: '',
          map: 'town',
          position: {x: 12, y: 8},
          shipPosition: {x: 0, y: 0}
        };
        this.store.dispatch(new GameStateNewAction(initialState));
        this.store.dispatch(new EntityAddBeingAction(warrior));
        this.store.dispatch(new EntityAddBeingAction(ranger));
        this.store.dispatch(new EntityAddBeingAction(healer));
        resolve(true);
      }
    });
  }

  /**
   * Returns a canvas rendering context that may be drawn to.  A corresponding
   * call to releaseRenderContext will return the drawn content of the context.
   */
  getRenderContext(width: number, height: number): CanvasRenderingContext2D {
    if (this._canvasAcquired) {
      throw new Error('Only one rendering canvas is available at a time.' +
        ' Check for calls to this function without corresponding releaseCanvas() calls.');
    }
    this._canvasAcquired = true;
    this._renderCanvas.width = width;
    this._renderCanvas.height = height;
    const context: any = this._renderCanvas.getContext('2d');
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    (<any> context).imageSmoothingEnabled = false;
    return context;
  }

  /**
   * Call this after getRenderContext to finish rendering and have the source
   * of the canvas content returned as a data url string.
   */
  releaseRenderContext(): string {
    this._canvasAcquired = false;
    return this._renderCanvas.toDataURL();
  }

}
